package com.shringar.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RescheduleBookingRequest {
    @NotNull(message = "New appointment date is required")
    @Future(message = "New date must be in the future")
    private LocalDate newDate;

    private String reason;
}
