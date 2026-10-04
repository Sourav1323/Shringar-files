package com.shringar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceFeedbackResponse {
    private Long bookingId;
    private String bookingReference;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String artistName;
    private String city;
    private String area;
    private LocalDate appointmentDate;
    private Integer rating;
    private String feedback;
    private LocalDateTime confirmedAt;
}
