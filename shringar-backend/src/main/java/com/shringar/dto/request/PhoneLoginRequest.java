package com.shringar.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PhoneLoginRequest {

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Verification code is required")
    private String code;

    /** Only used if this phone doesn't match an existing account — ignored otherwise. */
    private String firstName;
}
