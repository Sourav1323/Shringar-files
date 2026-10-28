package com.shringar.dto.request;

import lombok.Data;

@Data
public class CancelBookingRequest {
    private String reason;
    private String upiId;
    private String customerUpiId;

    public String getEffectiveUpiId() {
        if (upiId != null && !upiId.isBlank()) return upiId.trim();
        if (customerUpiId != null && !customerUpiId.isBlank()) return customerUpiId.trim();
        return null;
    }
}
