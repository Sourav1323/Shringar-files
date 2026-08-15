package com.shringar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderResponse {
    private String razorpayOrderId;
    private String razorpayKeyId;
    private Long amountInPaise;
    private String currency;
    private Long bookingId;
}
