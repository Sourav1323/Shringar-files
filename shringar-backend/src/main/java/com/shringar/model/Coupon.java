package com.shringar.model;

import com.shringar.model.enums.CouponType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CouponType type;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    @Column(name = "min_order_value", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal minOrderValue = BigDecimal.ZERO;

    @Column(length = 100)
    private String description;

    @Column(name = "max_discount", precision = 10, scale = 2)
    private BigDecimal maxDiscount;        // cap for percent-type coupons

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "times_used")
    @Builder.Default
    private Integer timesUsed = 0;

    @Column(name = "valid_from")
    private LocalDateTime validFrom;

    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public boolean isCurrentlyValid() {
        LocalDateTime now = LocalDateTime.now();
        boolean withinDateRange = (validFrom == null || now.isAfter(validFrom))
                && (validUntil == null || now.isBefore(validUntil));
        boolean withinUsage = usageLimit == null || timesUsed < usageLimit;
        return isActive && withinDateRange && withinUsage;
    }
}
