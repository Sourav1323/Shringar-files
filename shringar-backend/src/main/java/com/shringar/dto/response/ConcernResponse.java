package com.shringar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConcernResponse {
    private Long id;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String bookingReference;
    private String category;
    private String subject;
    private String message;
    private String status;
    private String adminResponse;
    private LocalDateTime respondedAt;
    private String respondedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
