package com.shringar.model;

import com.shringar.model.enums.BookingStatus;
import com.shringar.model.enums.PreferredTime;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_reference", nullable = false, unique = true, length = 20)
    private String bookingReference;           // e.g. MA-2026-8872

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id")
    private Artist artist;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<BookingItem> items = new ArrayList<>();

    /* ── Schedule ── */
    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_time", nullable = false)
    private PreferredTime preferredTime;

    @Column(name = "specific_time")
    private LocalTime specificTime;            // optional exact time customer entered

    @Column(name = "time_notes", length = 255)
    private String timeNotes;                  // "must start before 10am" etc.

    /* ── Location ── */
    @Column(nullable = false, length = 50)
    private String city;

    @Column(nullable = false, length = 60)
    private String area;

    @Column(name = "full_address", nullable = false, columnDefinition = "TEXT")
    private String fullAddress;

    @Column(length = 10)
    private String pincode;

    /* ── Customer snapshot (in case profile changes later) ── */
    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    @Column(name = "customer_email", length = 100)
    private String customerEmail;

    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;

    /* ── Pricing ── */
    @Column(name = "designs_subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal designsSubtotal;

    @Column(name = "artist_visit_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal artistVisitFee = new BigDecimal("200.00");

    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "coupon_code", length = 20)
    private String couponCode;

    @Column(name = "grand_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal grandTotal;

    @Column(name = "advance_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal advanceAmount;

    @Column(name = "balance_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal balanceAmount;

    /* ── Status ── */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "is_advance_paid")
    @Builder.Default
    private Boolean isAdvancePaid = false;

    @Column(name = "is_balance_paid")
    @Builder.Default
    private Boolean isBalancePaid = false;

    // ── UPI payment (manual verification, no gateway) ──
    /** Customer says they've paid via UPI and it's waiting for the admin to confirm
     *  against their own bank/UPI app — distinct from isAdvancePaid, which only
     *  becomes true once the admin has actually verified and confirmed it. */
    @Column(name = "upi_payment_submitted")
    @Builder.Default
    private Boolean upiPaymentSubmitted = false;

    @Column(name = "upi_transaction_ref", length = 60)
    private String upiTransactionRef;   // customer-entered UTR / reference number, optional

    @Column(name = "payment_screenshot_url", length = 500)
    private String paymentScreenshotUrl; // customer-uploaded payment receipt / screenshot

    @Column(name = "upi_submitted_at")
    private java.time.LocalDateTime upiSubmittedAt;

    // ── Fulfillment confirmation (both parties must confirm for COMPLETED status) ──
    @Column(name = "customer_confirmed_completion")
    @Builder.Default
    private Boolean customerConfirmedCompletion = false;

    @Column(name = "designer_confirmed_completion")
    @Builder.Default
    private Boolean designerConfirmedCompletion = false;

    @Column(name = "customer_confirmed_at")
    private java.time.LocalDateTime customerConfirmedAt;

    @Column(name = "designer_confirmed_at")
    private java.time.LocalDateTime designerConfirmedAt;

    @Column(name = "fulfillment_rating")
    private Integer fulfillmentRating;    // customer's 1–5 star rating after completion

    @Column(name = "fulfillment_feedback", columnDefinition = "TEXT")
    private String fulfillmentFeedback;   // customer's written review

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "is_refund_eligible")
    private Boolean isRefundEligible;

    @Column(name = "refund_status", length = 40)
    private String refundStatus; // NOT_APPLICABLE, REQUESTED, INITIATED, REFUNDED, REJECTED

    @Column(name = "refund_amount", precision = 10, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "refund_id", length = 80)
    private String refundId;

    @Column(name = "cancelled_by", length = 30)
    private String cancelledBy; // CUSTOMER, ADMIN

    @Column(name = "refund_processed_at")
    private LocalDateTime refundProcessedAt;

    @Column(name = "refund_notes", columnDefinition = "TEXT")
    private String refundNotes;

    @Column(name = "customer_upi_id", length = 100)
    private String customerUpiId; // Customer's provided UPI ID for receiving refunds

    @Column(name = "approval_token", length = 64)
    private String approvalToken;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    private Payment payment;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void ensureApprovalToken() {
        if (this.approvalToken == null || this.approvalToken.isBlank()) {
            this.approvalToken = java.util.UUID.randomUUID().toString().replace("-", "");
        }
    }

    public LocalDateTime getSlotDateTime() {
        if (appointmentDate == null) return null;
        LocalTime time = specificTime != null ? specificTime : LocalTime.of(9, 0);
        return appointmentDate.atTime(time);
    }

    /**
     * Free cancellation window is 25% of the total duration between booking time (createdAt)
     * and appointment slot time. While this window is active, cancellation is free.
     * When the time is up (or slot has passed), cancellation is no longer valid and removed.
     */
    public LocalDateTime getCancellationDeadline() {
        if (createdAt == null || appointmentDate == null) return null;
        LocalDateTime slotDateTime = getSlotDateTime();
        long totalMinutes = java.time.Duration.between(createdAt, slotDateTime).toMinutes();
        if (totalMinutes <= 0) return createdAt;
        long allowedMinutes = Math.max(1, Math.round(totalMinutes * 0.25));
        return createdAt.plusMinutes(allowedMinutes);
    }

    public boolean canCancelFree() {
        if (createdAt == null || appointmentDate == null) return false;
        LocalDateTime slotDateTime = getSlotDateTime();
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(slotDateTime)) return false;

        LocalDateTime deadline = getCancellationDeadline();
        return deadline != null && now.isBefore(deadline);
    }

    public String getEffectiveRefundStatus() {
        if (refundStatus != null && !refundStatus.isBlank()) {
            return refundStatus;
        }
        if (status == com.shringar.model.enums.BookingStatus.CANCELLED) {
            if (Boolean.TRUE.equals(isRefundEligible) && Boolean.TRUE.equals(isAdvancePaid)) {
                return "INITIATED";
            }
            if (Boolean.TRUE.equals(isAdvancePaid)) {
                return "REQUESTED";
            }
            return "NOT_APPLICABLE";
        }
        return "NONE";
    }
}
