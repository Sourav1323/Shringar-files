package com.shringar.dto.request;

import com.shringar.model.enums.PreferredTime;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateBookingRequest {

    @NotNull(message = "Artist is required")
    private Long artistId;

    @NotNull(message = "Appointment date is required")
    @Future(message = "Appointment date must be in the future")
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

    @Pattern(regexp = "^[0-9]{6}$", message = "Pincode must be 6 digits")
    private String pincode;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Customer phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Customer phone must be exactly 10 digits")
    private String customerPhone;

    private String customerEmail;

    private String specialRequests;
}
