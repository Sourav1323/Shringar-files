package com.shringar.service;

import com.shringar.dto.request.CancelBookingRequest;
import com.shringar.dto.request.CreateBookingRequest;
import com.shringar.dto.request.RescheduleBookingRequest;
import com.shringar.dto.response.BookingItemResponse;
import com.shringar.dto.response.BookingResponse;
import com.shringar.exception.BadRequestException;
import com.shringar.exception.ResourceNotFoundException;
import com.shringar.model.*;
import com.shringar.model.enums.BookingStatus;
import com.shringar.model.enums.PaymentStatus;
import com.shringar.repository.*;
import com.shringar.service.notification.BookingNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ArtistRepository artistRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;
    private final BookingNotificationService bookingNotificationService;

    private static final BigDecimal ADVANCE_PERCENT = new BigDecimal("0.30");
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Creates a booking from the user's current cart. Cart is left untouched
     * until payment is verified (see PaymentService.verifyPayment), at which
     * point the cart is cleared.
     */
    @Transactional
    public BookingResponse createBooking(Long userId, CreateBookingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Your cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Add at least one design to your cart before booking");
        }

        Artist artist = artistRepository.findById(request.getArtistId())
                .orElseThrow(() -> new ResourceNotFoundException("Selected artist not found"));

        // ── Confirm artist is free that day (basic same-day-slot guard) ──
        List<Booking> conflicting = bookingRepository.findByArtistIdAndAppointmentDateAndStatusIn(
                artist.getId(), request.getAppointmentDate(),
                List.of(BookingStatus.CONFIRMED, BookingStatus.PENDING));
        if (conflicting.size() >= 3) {  // simple cap: max 3 bookings/artist/day
            throw new BadRequestException("This artist is fully booked on the selected date. Please choose another date or artist.");
        }

        BigDecimal designsSubtotal = cart.getSubtotal();
        BigDecimal visitFee = new BigDecimal("200.00");
        BigDecimal discount = cart.getDiscountAmount() != null ? cart.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal grandTotal = designsSubtotal.add(visitFee).subtract(discount);
        BigDecimal advance = grandTotal.multiply(ADVANCE_PERCENT).setScale(0, RoundingMode.CEILING);
        BigDecimal balance = grandTotal.subtract(advance);

        Booking booking = Booking.builder()
                .bookingReference(generateBookingReference())
                .user(user)
                .artist(artist)
                .appointmentDate(request.getAppointmentDate())
                .preferredTime(request.getPreferredTime())
                .specificTime(request.getSpecificTime())
                .timeNotes(request.getTimeNotes())
                .city(request.getCity())
                .area(request.getArea())
                .fullAddress(request.getFullAddress())
                .pincode(request.getPincode())
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .customerEmail(request.getCustomerEmail())
                .specialRequests(request.getSpecialRequests())
                .designsSubtotal(designsSubtotal)
                .artistVisitFee(visitFee)
                .discountAmount(discount)
                .couponCode(cart.getAppliedCouponCode())
                .grandTotal(grandTotal)
                .advanceAmount(advance)
                .balanceAmount(balance)
                .status(BookingStatus.PENDING)
                .isAdvancePaid(false)
                .build();

        cart.getItems().forEach(cartItem -> {
            BookingItem bi = BookingItem.builder()
                    .booking(booking)
                    .design(cartItem.getDesign())
                    .quantity(cartItem.getQuantity())
                    .priceAtBooking(cartItem.getDesign().getPrice())
                    .build();
            booking.getItems().add(bi);
        });

        Booking savedBooking = bookingRepository.save(booking);

        // pre-create a Payment shell — actual Razorpay order id attached in PaymentService
        Payment payment = Payment.builder()
                .booking(savedBooking)
                .advanceAmount(advance)
                .balanceAmount(balance)
                .advanceStatus(PaymentStatus.PENDING)
                .balanceStatus(PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);

        return toResponse(savedBooking);
    }

    public BookingResponse getBooking(Long userId, Long bookingId) {
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        return toResponse(booking);
    }

    public BookingResponse getByReference(String reference) {
        Booking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        return toResponse(booking);
    }

    public List<BookingResponse> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public BookingResponse cancelBooking(Long userId, Long bookingId, CancelBookingRequest request) {
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("This booking is already cancelled");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Completed bookings cannot be cancelled");
        }

        if (!booking.canCancelFree()) {
            throw new BadRequestException("The free cancellation window has expired (0 hours left). Cancellations can only be made while the timer is active.");
        }

        boolean freeCancellation = true;

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancellationReason(request.getReason());
        booking.setIsRefundEligible(freeCancellation);

        bookingRepository.save(booking);

        // Trigger refund automatically if within the free-cancellation window and advance was paid
        if (freeCancellation && Boolean.TRUE.equals(booking.getIsAdvancePaid())) {
            paymentService.processRefundIfEligible(booking.getId());
        }

        bookingNotificationService.notifyBookingCancelled(booking);

        return toResponse(booking);
    }

    /**
     * Reschedule a CONFIRMED or PENDING booking to a new date.
     * Rules:
     * - Customer can only reschedule their own booking.
     * - Only CONFIRMED / PENDING bookings can be rescheduled (not CANCELLED / COMPLETED).
     * - Must be more than 24 hours before the current appointment.
     * - The new date must be in the future.
     * - No payment change — advance already paid carries over.
     * - A free reschedule is allowed once; subsequent reschedules are still allowed but
     *   logged for admin visibility (future: add a policy limit here if needed).
     */
    @Transactional
    public BookingResponse rescheduleBooking(Long userId, Long bookingId,
                                             RescheduleBookingRequest request) {
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED
                || booking.getStatus() == BookingStatus.COMPLETED
                || booking.getStatus() == BookingStatus.IN_PROGRESS) {
            throw new BadRequestException("This booking cannot be rescheduled in its current status.");
        }

        // Enforce the dynamic modification window
        if (!booking.canCancelFree()) {
            throw new BadRequestException("The rescheduling window has expired (0 hours left). Rescheduling can only be made while the timer is active.");
        }

        if (!request.getNewDate().isAfter(LocalDate.now())) {
            throw new BadRequestException("The new appointment date must be in the future.");
        }

        booking.setAppointmentDate(request.getNewDate());
        booking.setStatus(BookingStatus.RESCHEDULED);
        if (request.getReason() != null && !request.getReason().isBlank()) {
            booking.setTimeNotes("Rescheduled: " + request.getReason());
        }

        bookingRepository.save(booking);
        return toResponse(booking);
    }

    private String generateBookingReference() {
        int randomPart = 1000 + RANDOM.nextInt(9000);
        return "SH-" + Year.now().getValue() + "-" + randomPart;
    }

    /**
     * Customer confirms the appointment happened and leaves a rating + optional feedback.
     * If the designer has already confirmed, the booking is marked COMPLETED.
     */
    @Transactional
    public BookingResponse customerConfirmFulfillment(Long userId, Long bookingId, int rating, String feedback) {
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("A cancelled booking cannot be confirmed.");
        }

        booking.setCustomerConfirmedCompletion(true);
        booking.setCustomerConfirmedAt(LocalDateTime.now());
        if (rating >= 1 && rating <= 5) booking.setFulfillmentRating(rating);
        if (feedback != null && !feedback.isBlank()) booking.setFulfillmentFeedback(feedback);

        // Mark COMPLETED when both customer and designer have confirmed
        if (Boolean.TRUE.equals(booking.getDesignerConfirmedCompletion())) {
            booking.setStatus(BookingStatus.COMPLETED);
        } else {
            booking.setStatus(BookingStatus.COMPLETED); // customer confirmation alone is sufficient for now
        }

        bookingRepository.save(booking);
        return toResponse(booking);
    }

    /**
     * Customer says they've paid the advance via UPI. This does NOT mark the
     * booking as paid — it just flags it for the admin to manually verify
     * against their own bank/UPI app and confirm. No payment gateway means no
     * automatic verification, which is the trade-off of the zero-fee UPI path.
     */
    @Transactional
    public BookingResponse submitUpiPayment(Long userId, Long bookingId, String transactionRef) {
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (Boolean.TRUE.equals(booking.getIsAdvancePaid())) {
            throw new BadRequestException("This booking's advance has already been confirmed as paid.");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("This booking has been cancelled.");
        }

        booking.setUpiPaymentSubmitted(true);
        booking.setUpiTransactionRef(transactionRef != null && !transactionRef.isBlank() ? transactionRef.trim() : null);
        booking.setUpiSubmittedAt(LocalDateTime.now());

        bookingRepository.save(booking);
        return toResponse(booking);
    }

    /**
     * Admin has checked their own UPI app/bank statement and confirms the
     * advance genuinely arrived. This is the manual equivalent of what a
     * payment gateway's webhook would normally do automatically — fires the
     * exact same booking-confirmed notifications as the Razorpay path so the
     * customer, admin team, and assigned artist all still get notified.
     */
    @Transactional
    public BookingResponse confirmUpiPayment(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        booking.setIsAdvancePaid(true);
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        // Force-initialize the lazy artist association inside this transaction —
        // notifications fire on a separate async thread after this method returns.
        if (booking.getArtist() != null) {
            booking.getArtist().getName();
        }

        bookingNotificationService.notifyBookingConfirmed(booking);

        return toResponse(booking);
    }

    private BookingResponse toResponse(Booking b) {
        List<BookingItemResponse> items = b.getItems().stream()
                .map(i -> BookingItemResponse.builder()
                        .designName(i.getDesign().getName())
                        .emojiIcon(i.getDesign().getEmojiIcon())
                        .quantity(i.getQuantity())
                        .price(i.getPriceAtBooking())
                        .build())
                .toList();

        LocalDateTime deadline = b.getCancellationDeadline();
        Long remainingSeconds = null;
        if (deadline != null) {
            long secs = java.time.Duration.between(LocalDateTime.now(), deadline).getSeconds();
            remainingSeconds = Math.max(0, secs);
        }

        return BookingResponse.builder()
                .id(b.getId())
                .bookingReference(b.getBookingReference())
                .appointmentDate(b.getAppointmentDate())
                .preferredTime(b.getPreferredTime())
                .specificTime(b.getSpecificTime())
                .city(b.getCity())
                .area(b.getArea())
                .fullAddress(b.getFullAddress())
                .artistName(b.getArtist() != null ? b.getArtist().getName() : null)
                .artistRating(b.getArtist() != null ? b.getArtist().getRating() : null)
                .items(items)
                .designsSubtotal(b.getDesignsSubtotal())
                .artistVisitFee(b.getArtistVisitFee())
                .discountAmount(b.getDiscountAmount())
                .grandTotal(b.getGrandTotal())
                .advanceAmount(b.getAdvanceAmount())
                .balanceAmount(b.getBalanceAmount())
                .status(b.getStatus())
                .isAdvancePaid(b.getIsAdvancePaid())
                .upiPaymentSubmitted(b.getUpiPaymentSubmitted())
                .canCancelFree(b.canCancelFree())
                .cancellationDeadline(deadline)
                .cancellationRemainingSeconds(remainingSeconds)
                .customerConfirmedCompletion(b.getCustomerConfirmedCompletion())
                .designerConfirmedCompletion(b.getDesignerConfirmedCompletion())
                .fulfillmentRating(b.getFulfillmentRating())
                .fulfillmentFeedback(b.getFulfillmentFeedback())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
