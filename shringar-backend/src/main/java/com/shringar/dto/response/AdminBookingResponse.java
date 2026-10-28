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
import java.time.LocalTime;
import java.util.List;

/** Like BookingResponse but includes customer identity + balance-paid status — admin eyes only. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminBookingResponse {
    private Long id;
    private String bookingReference;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private LocalDate appointmentDate;
    private PreferredTime preferredTime;
    private LocalTime specificTime;
    private String city;
    private String area;
    private String fullAddress;
    private String artistName;
    private List<BookingItemResponse> items;
    private BigDecimal designsSubtotal;
    private BigDecimal artistVisitFee;
    private BigDecimal discountAmount;
    private BigDecimal grandTotal;
    private BigDecimal advanceAmount;
    private BigDecimal balanceAmount;
    private BookingStatus status;
    private Boolean isAdvancePaid;
    private Boolean upiPaymentSubmitted;
    private String upiTransactionRef;
    private Boolean isBalancePaid;
    private String refundStatus;
    private BigDecimal refundAmount;
    private String refundId;
    private String cancelledBy;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private Boolean isRefundEligible;
    private LocalDateTime refundProcessedAt;
    private String refundNotes;
    private String customerUpiId;
    private Boolean customerConfirmedCompletion;
    private Integer fulfillmentRating;
    private String fulfillmentFeedback;
    private LocalDateTime customerConfirmedAt;
    private LocalDateTime createdAt;
}
