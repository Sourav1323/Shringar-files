package com.shringar.dto.request;

import com.shringar.model.enums.PreferredTime;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {

    @NotNull(message = "Artist is required")
    private Long artistId;

    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(message = "Appointment date cannot be in the past")
    private LocalDate appointmentDate;

    @NotNull(message = "Preferred time is required")
    private PreferredTime preferredTime;

    private LocalTime specificTime;        // optional

    private String timeNotes;              // optional

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Area is required")
    private String area;

    @NotBlank(message = "Full address is required")
    private String fullAddress;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Pincode must be a valid 6-digit Indian PIN code")
    private String pincode;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Customer phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Customer phone must be exactly 10 digits")
    private String customerPhone;

    private String customerEmail;

    private String specialRequests;

    private String upiTransactionRef;

    private String paymentScreenshotUrl;

    /**
     * Optional design items passed directly from frontend cart.
     * Prevents empty cart failures when items were in client storage.
     */
    private List<BookingItemDto> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingItemDto {
        private Long designId;
        private Integer quantity;
        private BigDecimal price;
    }
}
