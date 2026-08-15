package com.shringar.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApplyCouponRequest {

    @NotBlank(message = "Coupon code is required")
    private String code;
}
