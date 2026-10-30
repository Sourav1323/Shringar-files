package com.shringar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomRequestResponse {
    private Long id;
    private String requestReference;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
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
    private String status;
    private BigDecimal quotedPrice;
    private BigDecimal advanceRequired;
    private Boolean advancePaid;
    private String artistAssigned;
    private String adminNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
