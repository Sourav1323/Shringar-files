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

/**
 * Dedicated database table for tracking each designer's individual order history:
 * - Which designer got how many orders
 * - For which specific designs
 * - On which ceremony dates and slots
 * - For what order amounts
 * - Total earnings and payouts of each designer
 */
@Entity
@Table(name = "designer_orders", indexes = {
    @Index(name = "idx_designer_orders_designer_id", columnList = "designer_id"),
    @Index(name = "idx_designer_orders_date_slot", columnList = "designer_id, appointment_date, preferred_time"),
    @Index(name = "idx_designer_orders_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "designer_id", nullable = false)
    private Artist designer;

    @Column(name = "designer_name", nullable = false, length = 100)
    private String designerName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "booking_reference", nullable = false, length = 30)
    private String bookingReference;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    @Column(name = "customer_email", length = 100)
    private String customerEmail;

    /* ── Schedule ── */
    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_time", nullable = false, length = 20)
    private PreferredTime preferredTime;

    @Column(name = "time_slot", length = 60)
    private String timeSlot;

    /* ── Venue ── */
    @Column(nullable = false, length = 50)
    private String city;

    @Column(nullable = false, length = 80)
    private String area;

    @Column(name = "full_address", columnDefinition = "TEXT")
    private String fullAddress;

    @Column(length = 10)
    private String pincode;

    /* ── Designs & Artworks Summary ── */
    @Column(name = "designs_summary", nullable = false, columnDefinition = "TEXT")
    private String designsSummary;

    @Column(name = "designs_count", nullable = false)
    @Builder.Default
    private Integer designsCount = 1;

    /* ── Financials & Designer Earnings ── */
    @Column(name = "order_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal orderTotal;

    @Column(name = "designer_earnings", nullable = false, precision = 10, scale = 2)
    private BigDecimal designerEarnings;

    @Column(name = "platform_commission", nullable = false, precision = 10, scale = 2)
    private BigDecimal platformCommission;

    @Column(name = "advance_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal advanceAmount;

    @Column(name = "balance_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal balanceAmount;

    /* ── Status Lifecycle ── */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
