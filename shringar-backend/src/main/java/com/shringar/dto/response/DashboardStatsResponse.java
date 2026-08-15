package com.shringar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private Long totalOrders;              // bookings where advance was paid (a "real" order)
    private Long totalBookingAttempts;      // every Booking row created, incl. abandoned-before-payment
    private BigDecimal totalOrderValue;     // sum of grandTotal across confirmed orders
    private BigDecimal totalAdvanceReceived;
    private BigDecimal totalBalancePending; // owed to artists, not yet collected
    private Long pendingOrders;
    private Long confirmedOrders;
    private Long completedOrders;
    private Long cancelledOrders;
    private Long totalCustomers;
    private Long totalDesigns;
    private Long totalArtists;
}
