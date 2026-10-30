package com.shringar.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCustomRequest {

    private Long userId;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    private String customerEmail;

    @NotBlank(message = "Customer phone is required")
    private String customerPhone;

    @NotBlank(message = "Design title is required")
    private String title;

    private String category;

    private String coverage;

    private String description;

    private String referenceImageUrl;

    private LocalDate eventDate;

    private String preferredTime;

    private String city;

    private String pincode;

    private String venueAddress;
}
