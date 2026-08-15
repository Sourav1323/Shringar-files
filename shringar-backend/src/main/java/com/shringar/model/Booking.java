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

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    private Payment payment;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** Free cancellation allowed up to 48 hrs before appointment */
    public boolean canCancelFree() {
        LocalDateTime appointmentDateTime = appointmentDate.atTime(
                specificTime != null ? specificTime : LocalTime.NOON);
        return LocalDateTime.now().isBefore(appointmentDateTime.minusHours(48));
    }
}
