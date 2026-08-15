package com.shringar.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<CartItem> items = new ArrayList<>();

    @Column(name = "applied_coupon_code", length = 20)
    private String appliedCouponCode;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public BigDecimal getSubtotal() {
        return items.stream()
                .map(item -> item.getDesign().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTotalWithFee() {
        BigDecimal visitFee = new BigDecimal("200.00");
        return getSubtotal().add(visitFee).subtract(discountAmount != null ? discountAmount : BigDecimal.ZERO);
    }

    public BigDecimal getAdvanceAmount() {
        return getTotalWithFee().multiply(new BigDecimal("0.30")).setScale(0, java.math.RoundingMode.CEILING);
    }

    public BigDecimal getBalanceAmount() {
        return getTotalWithFee().subtract(getAdvanceAmount());
    }

    public int getItemCount() {
        return items.size();
    }
}
