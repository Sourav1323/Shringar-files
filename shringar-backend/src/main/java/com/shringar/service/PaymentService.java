package com.shringar.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.shringar.dto.request.VerifyPaymentRequest;
import com.shringar.dto.response.PaymentOrderResponse;
import com.shringar.exception.BadRequestException;
import com.shringar.exception.ResourceNotFoundException;
import com.shringar.model.Booking;
import com.shringar.model.Payment;
import com.shringar.model.enums.BookingStatus;
import com.shringar.model.enums.PaymentStatus;
import com.shringar.repository.BookingRepository;
import com.shringar.repository.CartRepository;
import com.shringar.repository.PaymentRepository;
import com.shringar.service.notification.BookingNotificationService;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final CartRepository cartRepository;
    private final BookingNotificationService bookingNotificationService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    /** Step 1: create a Razorpay order for the 30% advance amount */
    @Transactional
    public PaymentOrderResponse createAdvanceOrder(Long userId, Long bookingId) {
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (Boolean.TRUE.equals(booking.getIsAdvancePaid())) {
            throw new BadRequestException("Advance has already been paid for this booking");
        }

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for this booking"));

        long amountInPaise = booking.getAdvanceAmount().multiply(new BigDecimal("100")).longValue();

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", booking.getBookingReference());
            orderRequest.put("notes", new JSONObject().put("bookingId", bookingId.toString()));

            com.razorpay.Order order = client.orders.create(orderRequest);
            String razorpayOrderId = order.get("id");

            payment.setRazorpayOrderId(razorpayOrderId);
            paymentRepository.save(payment);

            return PaymentOrderResponse.builder()
                    .razorpayOrderId(razorpayOrderId)
                    .razorpayKeyId(razorpayKeyId)
                    .amountInPaise(amountInPaise)
                    .currency("INR")
                    .bookingId(bookingId)
                    .build();

        } catch (RazorpayException e) {
            throw new BadRequestException("Could not initiate payment: " + e.getMessage());
        }
    }

    /** Step 2: verify the signature Razorpay sends back after checkout completes */
    @Transactional
    public void verifyAdvancePayment(Long userId, VerifyPaymentRequest request) {
        Booking booking = bookingRepository.findByIdAndUserId(request.getBookingId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        Payment payment = paymentRepository.findByBookingId(booking.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found"));

        boolean valid = verifySignature(
                request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature());

        if (!valid) {
            payment.setAdvanceStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new BadRequestException("Payment verification failed. Please try again or contact support.");
        }

        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setAdvanceStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        booking.setIsAdvancePaid(true);
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        // clear the user's cart now that booking is confirmed
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getItems().clear();
            cart.setAppliedCouponCode(null);
            cart.setDiscountAmount(BigDecimal.ZERO);
            cartRepository.save(cart);
        });

        // Force-initialize the lazy artist association *inside* this transaction —
        // the notification fan-out below runs on a separate async thread after this
        // method returns and the Hibernate session closes, so booking.getArtist()
        // must already be populated or the async thread will hit a
        // LazyInitializationException when EmailService reads artist.getEmail()/getName().
        if (booking.getArtist() != null) {
            booking.getArtist().getName();
        }

        bookingNotificationService.notifyBookingConfirmed(booking);
    }

    /** Triggered by BookingService.cancelBooking() when free-cancellation window still applies */
    @Transactional
    public void processRefundIfEligible(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!Boolean.TRUE.equals(booking.getIsRefundEligible()) || !Boolean.TRUE.equals(booking.getIsAdvancePaid())) {
            return; // nothing to refund — outside 48hr window or advance was never paid
        }

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found"));

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            long amountInPaise = payment.getAdvanceAmount().multiply(new BigDecimal("100")).longValue();

            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", amountInPaise);

            com.razorpay.Refund refund = client.payments.refund(payment.getRazorpayPaymentId(), refundRequest);

            payment.setRefundId(refund.get("id"));
            payment.setRefundAmount(payment.getAdvanceAmount());
            payment.setAdvanceStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);

        } catch (RazorpayException e) {
            throw new BadRequestException("Refund could not be processed automatically. Our team will process it manually within 5-7 days.");
        }
    }

    /** Records that the remaining 70% balance was settled directly with the artist (cash/UPI) */
    @Transactional
    public void markBalancePaid(Long bookingId, String method) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found"));
        payment.setBalanceStatus(PaymentStatus.SUCCESS);
        payment.setBalancePaidMethod(method);
        paymentRepository.save(payment);

        Booking booking = payment.getBooking();
        booking.setIsBalancePaid(true);
        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);
    }

    /** HMAC-SHA256 signature check exactly as per Razorpay's documented verification flow */
    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes());
            String generatedSignature = HexFormat.of().formatHex(hash);
            return generatedSignature.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }
}
