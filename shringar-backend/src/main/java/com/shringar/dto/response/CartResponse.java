package com.shringar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private Long cartId;
    private List<CartItemResponse> items;
    private Integer itemCount;
    private BigDecimal subtotal;
    private BigDecimal artistVisitFee;
    private String appliedCouponCode;
    private BigDecimal discountAmount;
    private BigDecimal total;
    private BigDecimal advanceAmount;
    private BigDecimal balanceAmount;
}
