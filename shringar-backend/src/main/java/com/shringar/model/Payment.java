package com.shringar.model;

import com.shringar.model.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @Column(name = "razorpay_order_id", length = 60)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id", length = 60)
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature", length = 255)
    private String razorpaySignature;

    @Column(name = "advance_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal advanceAmount;

    @Column(name = "balance_amount", precision = 10, scale = 2)
    private BigDecimal balanceAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "advance_status", nullable = false)
    @Builder.Default
    private PaymentStatus advanceStatus = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "balance_status")
    @Builder.Default
    private PaymentStatus balanceStatus = PaymentStatus.PENDING;

    @Column(name = "balance_paid_method", length = 30)
    private String balancePaidMethod;      // CASH / UPI — paid directly to artist

    @Column(name = "refund_amount", precision = 10, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "refund_id", length = 60)
    private String refundId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
