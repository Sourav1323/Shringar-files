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
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ArtistRepository artistRepository;
    private final DesignRepository designRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;
    private final BookingNotificationService bookingNotificationService;
    private final DesignerOrderService designerOrderService;
    private final CouponRepository couponRepository;

    private static final BigDecimal ADVANCE_PERCENT = new BigDecimal("0.30");
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Creates a booking from the user's current cart. Cart is left untouched
     * until payment is verified (see PaymentService.verifyPayment), at which
     * point the cart is cleared.
     */
    @Transactional
    public BookingResponse createBooking(Long userId, CreateBookingRequest request) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        if (user == null && request.getCustomerPhone() != null && !request.getCustomerPhone().isBlank()) {
            user = userRepository.findByPhone(request.getCustomerPhone().trim()).orElse(null);
        }
        if (user == null && request.getCustomerEmail() != null && !request.getCustomerEmail().isBlank()) {
            user = userRepository.findByEmail(request.getCustomerEmail().trim()).orElse(null);
        }
        if (user == null) {
            String rawName = request.getCustomerName() != null && !request.getCustomerName().isBlank()
                    ? request.getCustomerName().trim() : "Valued Patron";
            String[] nameParts = rawName.split("\\s+", 2);
            String firstName = nameParts[0];
            String lastName = nameParts.length > 1 ? nameParts[1] : "";

            // Automatically create customer record for seamless checkout
            user = User.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .phone(request.getCustomerPhone() != null ? request.getCustomerPhone().trim() : "9876543210")
                    .email(request.getCustomerEmail() != null && !request.getCustomerEmail().isBlank()
                            ? request.getCustomerEmail().trim()
                            : "guest_" + (request.getCustomerPhone() != null ? request.getCustomerPhone().trim() : "user") + "@shringar.in")
                    .passwordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                    .role(com.shringar.model.enums.Role.CUSTOMER)
                    .isActive(true)
                    .build();
            user = userRepository.save(user);
        }

        Artist artist = artistRepository.findById(request.getArtistId())
                .orElseThrow(() -> new ResourceNotFoundException("Selected artist not found"));

        if (Boolean.FALSE.equals(artist.getIsActive())) {
            throw new BadRequestException("Selected artist is currently unavailable or inactive.");
        }

        // ── Strict Designer Availability Check: No Ambiguity for Date & Slot ──
        designerOrderService.validateDesignerAvailability(artist.getId(), request.getAppointmentDate(), request.getPreferredTime());

        // ── Appointment Date Validation ──
        if (request.getAppointmentDate() == null) {
            throw new BadRequestException("Appointment date is required");
        }
        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Appointment date cannot be in the past");
        }

        // ── Confirm artist is free that day (strict 3-slot cap per day) ──
        List<Booking> conflicting = bookingRepository.findByArtistIdAndAppointmentDateAndStatusIn(
                artist.getId(), request.getAppointmentDate(),
                List.of(BookingStatus.CONFIRMED, BookingStatus.PENDING));
        if (conflicting.size() >= 3) {
            throw new BadRequestException("Booking is full for this day");
        }

        Cart cart = (user != null) ? cartRepository.findByUserId(user.getId()).orElse(null) : null;
        boolean hasDbCart = cart != null && !cart.getItems().isEmpty();

        BigDecimal designsSubtotal = BigDecimal.ZERO;
        BigDecimal discount = BigDecimal.ZERO;
        String couponCode = null;

        if (hasDbCart) {
            designsSubtotal = cart.getSubtotal();
            discount = cart.getDiscountAmount() != null ? cart.getDiscountAmount() : BigDecimal.ZERO;
            couponCode = cart.getAppliedCouponCode();
        } else if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (CreateBookingRequest.BookingItemDto itemDto : request.getItems()) {
                Design d = designRepository.findById(itemDto.getDesignId())
                        .orElseThrow(() -> new ResourceNotFoundException("Design not found with id: " + itemDto.getDesignId()));
                int qty = itemDto.getQuantity() != null && itemDto.getQuantity() > 0 ? itemDto.getQuantity() : 1;
                BigDecimal price = d.getPrice() != null ? d.getPrice() : BigDecimal.ZERO;
                designsSubtotal = designsSubtotal.add(price.multiply(BigDecimal.valueOf(qty)));
            }
        } else {
            throw new BadRequestException("Add at least one design to your cart before booking");
        }

        BigDecimal visitFee = new BigDecimal("200.00");
        BigDecimal preDiscountTotal = designsSubtotal.add(visitFee);

        // ── Server-Side Coupon Validation & Execution ──
        String requestedCoupon = (request.getCouponCode() != null && !request.getCouponCode().isBlank())
                ? request.getCouponCode().trim().toUpperCase()
                : couponCode;

        if (requestedCoupon != null && !requestedCoupon.isBlank()) {
            Coupon coupon = couponRepository.findByCodeIgnoreCase(requestedCoupon)
                    .orElseThrow(() -> new BadRequestException("Invalid coupon code: " + requestedCoupon));

            if (!coupon.isCurrentlyValid()) {
                throw new BadRequestException("Coupon " + requestedCoupon + " has expired or reached its usage limit");
            }

            if (coupon.getMinOrderValue() != null && preDiscountTotal.compareTo(coupon.getMinOrderValue()) < 0) {
                throw new BadRequestException("Minimum order of ₹" + coupon.getMinOrderValue() + " required for coupon " + requestedCoupon);
            }

            if (coupon.getType() == com.shringar.model.enums.CouponType.PERCENT) {
                discount = preDiscountTotal.multiply(coupon.getValue()).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                if (coupon.getMaxDiscount() != null && discount.compareTo(coupon.getMaxDiscount()) > 0) {
                    discount = coupon.getMaxDiscount();
                }
            } else {
                discount = coupon.getValue();
            }

            couponCode = coupon.getCode();
            coupon.setTimesUsed(coupon.getTimesUsed() + 1);
            couponRepository.save(coupon);
        }

        BigDecimal grandTotal = preDiscountTotal.subtract(discount);
        if (grandTotal.compareTo(BigDecimal.ZERO) < 0) grandTotal = BigDecimal.ZERO;
        BigDecimal advance = grandTotal.multiply(ADVANCE_PERCENT).setScale(0, RoundingMode.CEILING);
        BigDecimal balance = grandTotal.subtract(advance);

        // ── Pincode Distance & Minimum Booking Requirement Validation ──
        double distanceKm = estimatePincodeDistance(request.getPincode(), artist, request.getCity());
        if (distanceKm > 10.0) {
            double extraKm = distanceKm - 10.0;
            int brackets = (int) Math.ceil(extraKm / 10.0);
            BigDecimal minOrderAmount = new BigDecimal(brackets * 350);
            if (grandTotal.compareTo(minOrderAmount) < 0) {
                throw new BadRequestException("Distance to your venue is " + String.format("%.1f", distanceKm)
                        + " km (>10 km zone). Minimum booking order amount is Rs." + minOrderAmount
                        + " (Rs.350 per 10 km bracket beyond 10 km). Please add more designs to your package.");
            }
        }

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
                .couponCode(couponCode)
                .grandTotal(grandTotal)
                .advanceAmount(advance)
                .balanceAmount(balance)
                .status(BookingStatus.PENDING)
                .isAdvancePaid(false)
                .upiPaymentSubmitted(request.getUpiTransactionRef() != null && !request.getUpiTransactionRef().isBlank())
                .upiTransactionRef(request.getUpiTransactionRef() != null && !request.getUpiTransactionRef().isBlank() ? request.getUpiTransactionRef().trim() : null)
                .paymentScreenshotUrl(request.getPaymentScreenshotUrl() != null && !request.getPaymentScreenshotUrl().isBlank() ? request.getPaymentScreenshotUrl().trim() : null)
                .upiSubmittedAt(request.getUpiTransactionRef() != null && !request.getUpiTransactionRef().isBlank() ? LocalDateTime.now() : null)
                .build();

        if (hasDbCart) {
            cart.getItems().forEach(cartItem -> {
                BookingItem bi = BookingItem.builder()
                        .booking(booking)
                        .design(cartItem.getDesign())
                        .quantity(cartItem.getQuantity())
                        .priceAtBooking(cartItem.getDesign().getPrice())
                        .build();
                booking.getItems().add(bi);
            });
        } else if (request.getItems() != null) {
            for (CreateBookingRequest.BookingItemDto itemDto : request.getItems()) {
                Design d = designRepository.findById(itemDto.getDesignId()).orElse(null);
                if (d != null) {
                    int qty = itemDto.getQuantity() != null && itemDto.getQuantity() > 0 ? itemDto.getQuantity() : 1;
                    BookingItem bi = BookingItem.builder()
                            .booking(booking)
                            .design(d)
                            .quantity(qty)
                            .priceAtBooking(d.getPrice())
                            .build();
                    booking.getItems().add(bi);
                }
            }
        }

        Booking savedBooking = bookingRepository.save(booking);

        // Pre-create Payment record shell
        Payment payment = Payment.builder()
                .booking(savedBooking)
                .advanceAmount(advance)
                .balanceAmount(balance)
                .advanceStatus(PaymentStatus.PENDING)
                .balanceStatus(PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);

        // Record in dedicated designer_orders database table
        designerOrderService.recordBookingOrder(savedBooking);

        // Send booking details email to customer and new order alert email (with 1-click approve link) to admin
        bookingNotificationService.notifyBookingReceived(savedBooking);

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
        Booking booking = (userId != null)
                ? bookingRepository.findByIdAndUserId(bookingId, userId).orElseGet(() -> bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking not found")))
                : bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("This booking is already cancelled");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Completed bookings cannot be cancelled");
        }

        boolean freeCancellation = booking.canCancelFree();
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancellationReason(request != null && request.getReason() != null && !request.getReason().isBlank() 
                ? request.getReason() 
                : "Cancelled by customer");
        booking.setCancelledBy("CUSTOMER");
        booking.setIsRefundEligible(freeCancellation);
        if (request != null && request.getEffectiveUpiId() != null) {
            booking.setCustomerUpiId(request.getEffectiveUpiId());
        }

        if (Boolean.TRUE.equals(booking.getIsAdvancePaid())) {
            booking.setRefundAmount(booking.getAdvanceAmount());
            if (freeCancellation) {
                booking.setRefundStatus("INITIATED");
                try {
                    paymentService.processRefundIfEligible(booking.getId());
                    booking.setRefundStatus("REFUNDED");
                    booking.setRefundProcessedAt(LocalDateTime.now());
                } catch (Exception e) {
                    log.warn("Auto-refund could not complete via gateway: {}. Flagged as INITIATED for administrative transfer.", e.getMessage());
                    booking.setRefundStatus("INITIATED");
                }
            } else {
                // Outside free cancellation window — submit refund request to admin for review
                booking.setRefundStatus("REQUESTED");
                booking.setRefundNotes("Customer requested cancellation outside free-cancellation window. Submitted to admin for policy review.");
            }
        } else {
            booking.setRefundStatus("NOT_APPLICABLE");
            booking.setRefundAmount(BigDecimal.ZERO);
        }

        Booking saved = bookingRepository.save(booking);

        // Update dedicated designer_orders table
        designerOrderService.updateOrderStatus(saved.getId(), BookingStatus.CANCELLED);

        // Trigger notifications to customer and admin
        bookingNotificationService.notifyBookingCancelled(booking);

        return toResponse(saved);
    }

    /**
     * Admin cancels a booking for any reason (e.g. artist illness, operational reasons).
     * Because the platform initiates cancellation, the customer is ALWAYS entitled to a 100% full refund!
     */
    @Transactional
    public BookingResponse adminCancelBooking(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking #" + bookingId + " not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("This booking is already cancelled");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Completed bookings cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancellationReason(reason != null && !reason.isBlank() ? reason : "Cancelled by Administration");
        booking.setCancelledBy("ADMIN");
        booking.setIsRefundEligible(true);

        if (Boolean.TRUE.equals(booking.getIsAdvancePaid())) {
            booking.setRefundAmount(booking.getAdvanceAmount());
            booking.setRefundStatus("INITIATED");
            try {
                paymentService.processRefundIfEligible(booking.getId());
                booking.setRefundStatus("REFUNDED");
                booking.setRefundProcessedAt(LocalDateTime.now());
            } catch (Exception e) {
                log.warn("Automatic gateway refund notice: {}. Marked as INITIATED for direct payout.", e.getMessage());
                booking.setRefundStatus("INITIATED");
            }
        } else {
            booking.setRefundStatus("NOT_APPLICABLE");
            booking.setRefundAmount(BigDecimal.ZERO);
        }

        Booking saved = bookingRepository.save(booking);
        designerOrderService.updateOrderStatus(saved.getId(), BookingStatus.CANCELLED);

        // Notify customer that admin cancelled and 100% full refund was initiated
        bookingNotificationService.notifyAdminCancelledBooking(booking);

        return toResponse(saved);
    }

    /**
     * Admin approves a customer refund request that was pending review.
     */
    @Transactional
    public BookingResponse adminApproveRefund(Long bookingId, String notes) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking #" + bookingId + " not found"));

        booking.setIsRefundEligible(true);
        booking.setRefundStatus("REFUNDED");
        booking.setRefundProcessedAt(LocalDateTime.now());
        booking.setRefundAmount(booking.getAdvanceAmount());
        if (notes != null && !notes.isBlank()) {
            booking.setRefundNotes(notes);
        }
        if (booking.getRefundId() == null || booking.getRefundId().isBlank()) {
            booking.setRefundId("REF-" + System.currentTimeMillis());
        }

        Payment payment = paymentRepository.findByBookingId(bookingId).orElse(null);
        if (payment != null) {
            payment.setAdvanceStatus(com.shringar.model.enums.PaymentStatus.REFUNDED);
            payment.setRefundAmount(booking.getAdvanceAmount());
            payment.setRefundId(booking.getRefundId());
            paymentRepository.save(payment);
        }

        Booking saved = bookingRepository.save(booking);
        bookingNotificationService.notifyRefundApproved(booking);

        return toResponse(saved);
    }

    /**
     * Admin rejects a refund request (e.g. late cancellation where policy strictly applies).
     */
    @Transactional
    public BookingResponse adminRejectRefund(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking #" + bookingId + " not found"));

        booking.setIsRefundEligible(false);
        booking.setRefundStatus("REJECTED");
        booking.setRefundNotes(reason);

        Booking saved = bookingRepository.save(booking);
        bookingNotificationService.notifyRefundRejected(booking, reason);

        return toResponse(saved);
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

        Booking saved = bookingRepository.save(booking);
        designerOrderService.updateOrderStatus(saved.getId(), BookingStatus.COMPLETED);
        return toResponse(saved);
    }

    /**
     * Customer says they've paid the advance via UPI. This does NOT mark the
     * booking as paid — it just flags it for the admin to manually verify
     * against their own bank/UPI app and confirm. No payment gateway means no
     * automatic verification, which is the trade-off of the zero-fee UPI path.
     */
    @Transactional
    public BookingResponse submitUpiPayment(Long userId, Long bookingId, String transactionRef, String paymentScreenshotUrl) {
        Booking booking = (userId != null)
                ? bookingRepository.findByIdAndUserId(bookingId, userId).orElse(null)
                : null;
        if (booking == null) {
            booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        }

        if (Boolean.TRUE.equals(booking.getIsAdvancePaid())) {
            throw new BadRequestException("This booking's advance has already been confirmed as paid.");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("This booking has been cancelled.");
        }

        if (transactionRef != null && !transactionRef.isBlank()) {
            String cleanRef = transactionRef.trim();
            if (bookingRepository.existsByUpiTransactionRefAndIdNot(cleanRef, bookingId)) {
                throw new BadRequestException("This UPI reference / UTR has already been submitted for another booking. Please check your transaction details.");
            }
            booking.setUpiTransactionRef(cleanRef);
        }

        if (paymentScreenshotUrl != null && !paymentScreenshotUrl.isBlank()) {
            booking.setPaymentScreenshotUrl(paymentScreenshotUrl.trim());
        }

        booking.setUpiPaymentSubmitted(true);
        booking.setUpiSubmittedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);

        // Update designer order record if needed
        designerOrderService.recordBookingOrder(saved);

        // Re-notify admin and customer with updated UTR and screenshot proof
        bookingNotificationService.notifyBookingReceived(saved);

        return toResponse(saved);
    }

    public BookingResponse submitUpiPayment(Long userId, Long bookingId, String transactionRef) {
        return submitUpiPayment(userId, bookingId, transactionRef, null);
    }

    private double estimatePincodeDistance(String userPin, Artist artist, String city) {
        if (userPin == null || userPin.trim().length() < 6) return 5.0;
        String cleanUser = userPin.trim();
        String artistPin = (artist != null && artist.getHomePincode() != null && !artist.getHomePincode().isBlank())
                ? artist.getHomePincode().trim()
                : null;
        if (artistPin == null) {
            artistPin = "110001";
            if (artist != null && artist.getCity() != null) {
                String c = artist.getCity().toLowerCase();
                if (c.contains("mumbai")) artistPin = "400001";
                else if (c.contains("bangalore") || c.contains("bengaluru")) artistPin = "560001";
                else if (c.contains("jaipur")) artistPin = "302001";
                else if (c.contains("ajmer")) artistPin = "305001";
                else if (c.contains("gurugram") || c.contains("gurgaon")) artistPin = "122001";
                else if (c.contains("hyderabad")) artistPin = "500001";
                else if (c.contains("kolkata")) artistPin = "700001";
                else if (c.contains("pune")) artistPin = "411001";
                else if (c.contains("ahmedabad")) artistPin = "380001";
            }
        }
        if (cleanUser.equals(artistPin)) return 2.5;
        if (cleanUser.length() >= 3 && artistPin.length() >= 3 && cleanUser.substring(0, 3).equals(artistPin.substring(0, 3))) {
            try {
                int diff = Math.abs(Integer.parseInt(cleanUser) - Integer.parseInt(artistPin));
                return Math.max(3.0, Math.min(28.0, diff * 0.45));
            } catch (Exception e) {
                return 6.0;
            }
        }
        if (cleanUser.length() >= 2 && artistPin.length() >= 2 && cleanUser.substring(0, 2).equals(artistPin.substring(0, 2))) {
            return 18.5; // same metro/sub-region
        }
        return 32.0; // outer regional bracket
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
        Booking saved = bookingRepository.save(booking);

        // Force-initialize the lazy artist association inside this transaction —
        // notifications fire on a separate async thread after this method returns.
        if (saved.getArtist() != null) {
            saved.getArtist().getName();
        }

        // Update dedicated designer_orders table
        designerOrderService.updateOrderStatus(saved.getId(), BookingStatus.CONFIRMED);

        bookingNotificationService.notifyBookingConfirmed(saved);

        return toResponse(saved);
    }

    /**
     * One-click approval from admin notification email without requiring login to the admin portal.
     * Marks the booking CONFIRMED and fires customer payment confirmation email.
     */
    @Transactional
    public Booking approveBookingByToken(String reference, String token) {
        Booking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking reference not found: " + reference));

        if (token == null || booking.getApprovalToken() == null || !token.trim().equals(booking.getApprovalToken().trim())) {
            throw new BadRequestException("Invalid or expired 1-click approval security token.");
        }

        if (booking.getStatus() == BookingStatus.CONFIRMED && Boolean.TRUE.equals(booking.getIsAdvancePaid())) {
            return booking;
        }

        booking.setIsAdvancePaid(true);
        booking.setStatus(BookingStatus.CONFIRMED);
        Booking saved = bookingRepository.save(booking);

        if (saved.getArtist() != null) {
            saved.getArtist().getName();
        }

        // Synchronize dedicated designer_orders table
        designerOrderService.updateOrderStatus(saved.getId(), BookingStatus.CONFIRMED);

        // Trigger payment confirmation email to customer, artist and admin
        bookingNotificationService.notifyBookingConfirmed(saved);

        return saved;
    }

    public List<String> getFullyBookedDates(Long artistId, String city, String startDateStr, String endDateStr) {
        LocalDate start = (startDateStr != null && !startDateStr.isBlank()) 
                ? LocalDate.parse(startDateStr) 
                : LocalDate.now();
        LocalDate end = (endDateStr != null && !endDateStr.isBlank()) 
                ? LocalDate.parse(endDateStr) 
                : start.plusDays(60);

        List<BookingStatus> activeStatuses = List.of(BookingStatus.CONFIRMED, BookingStatus.PENDING);
        List<String> busyDates = new java.util.ArrayList<>();

        if (artistId != null) {
            List<Booking> bookings = bookingRepository.findByArtistIdAndAppointmentDateBetweenAndStatusIn(artistId, start, end, activeStatuses);
            java.util.Map<LocalDate, Long> countsByDate = bookings.stream()
                    .collect(java.util.stream.Collectors.groupingBy(Booking::getAppointmentDate, java.util.stream.Collectors.counting()));
            for (java.util.Map.Entry<LocalDate, Long> entry : countsByDate.entrySet()) {
                if (entry.getValue() >= 3) {
                    busyDates.add(entry.getKey().toString());
                }
            }
        } else if (city != null && !city.isBlank()) {
            List<Artist> artists = artistRepository.findByCityFlexible(city);
            List<Artist> availableArtists = artists.stream()
                    .filter(a -> Boolean.TRUE.equals(a.getIsActive()) && (a.getIsAvailable() == null || Boolean.TRUE.equals(a.getIsAvailable())))
                    .toList();
            if (availableArtists.isEmpty()) {
                for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
                    busyDates.add(d.toString());
                }
                return busyDates;
            }
            List<Booking> bookings = bookingRepository.findByAppointmentDateBetweenAndStatusIn(start, end, activeStatuses);
            java.util.Map<LocalDate, java.util.Map<Long, Long>> artistCountsByDate = bookings.stream()
                    .filter(b -> b.getArtist() != null)
                    .collect(java.util.stream.Collectors.groupingBy(Booking::getAppointmentDate,
                            java.util.stream.Collectors.groupingBy(b -> b.getArtist().getId(), java.util.stream.Collectors.counting())));

            for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
                java.util.Map<Long, Long> counts = artistCountsByDate.getOrDefault(d, java.util.Map.of());
                boolean anyArtistAvailable = false;
                for (Artist a : availableArtists) {
                    if (counts.getOrDefault(a.getId(), 0L) < 3) {
                        anyArtistAvailable = true;
                        break;
                    }
                }
                if (!anyArtistAvailable) {
                    busyDates.add(d.toString());
                }
            }
        } else {
            List<Artist> allArtists = artistRepository.findAll().stream()
                    .filter(a -> Boolean.TRUE.equals(a.getIsActive()) && (a.getIsAvailable() == null || Boolean.TRUE.equals(a.getIsAvailable())))
                    .toList();
            if (!allArtists.isEmpty()) {
                List<Booking> bookings = bookingRepository.findByAppointmentDateBetweenAndStatusIn(start, end, activeStatuses);
                java.util.Map<LocalDate, java.util.Map<Long, Long>> artistCountsByDate = bookings.stream()
                        .filter(b -> b.getArtist() != null)
                        .collect(java.util.stream.Collectors.groupingBy(Booking::getAppointmentDate,
                                java.util.stream.Collectors.groupingBy(b -> b.getArtist().getId(), java.util.stream.Collectors.counting())));

                for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
                    java.util.Map<Long, Long> counts = artistCountsByDate.getOrDefault(d, java.util.Map.of());
                    boolean anyArtistAvailable = false;
                    for (Artist a : allArtists) {
                        if (counts.getOrDefault(a.getId(), 0L) < 3) {
                            anyArtistAvailable = true;
                            break;
                        }
                    }
                    if (!anyArtistAvailable) {
                        busyDates.add(d.toString());
                    }
                }
            }
        }
        return busyDates;
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
                .upiTransactionRef(b.getUpiTransactionRef())
                .paymentScreenshotUrl(b.getPaymentScreenshotUrl())
                .canCancelFree(b.canCancelFree())
                .cancellationDeadline(deadline)
                .cancellationRemainingSeconds(remainingSeconds)
                .refundStatus(b.getEffectiveRefundStatus())
                .refundAmount(b.getRefundAmount() != null ? b.getRefundAmount() : (Boolean.TRUE.equals(b.getIsRefundEligible()) && b.getAdvanceAmount() != null ? b.getAdvanceAmount() : BigDecimal.ZERO))
                .refundId(b.getRefundId())
                .cancelledBy(b.getCancelledBy())
                .cancelledAt(b.getCancelledAt())
                .cancellationReason(b.getCancellationReason())
                .isRefundEligible(b.getIsRefundEligible())
                .refundProcessedAt(b.getRefundProcessedAt())
                .refundNotes(b.getRefundNotes())
                .customerUpiId(b.getCustomerUpiId())
                .customerConfirmedCompletion(b.getCustomerConfirmedCompletion())
                .designerConfirmedCompletion(b.getDesignerConfirmedCompletion())
                .fulfillmentRating(b.getFulfillmentRating())
                .fulfillmentFeedback(b.getFulfillmentFeedback())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
