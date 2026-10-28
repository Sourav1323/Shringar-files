package com.shringar.dto.response;

import com.shringar.model.enums.BookingStatus;
import com.shringar.model.enums.PreferredTime;
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
public class DesignerOrderResponse {
    private Long id;
    private Long designerId;
    private String designerName;
    private Long bookingId;
    private String bookingReference;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private LocalDate appointmentDate;
    private PreferredTime preferredTime;
    private String timeSlot;
    private String city;
    private String area;
    private String fullAddress;
    private String pincode;
    private String designsSummary;
    private Integer designsCount;
    private BigDecimal orderTotal;
    private BigDecimal designerEarnings;
    private BigDecimal platformCommission;
    private BigDecimal advanceAmount;
    private BigDecimal balanceAmount;
    private BookingStatus status;
    private LocalDateTime createdAt;
}
