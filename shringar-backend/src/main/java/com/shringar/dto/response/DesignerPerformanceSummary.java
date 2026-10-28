package com.shringar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesignerPerformanceSummary {
    private Long designerId;
    private String designerName;
    private String city;
    private String specialization;
    private long totalOrdersCount;
    private BigDecimal totalGrossRevenue;
    private BigDecimal totalDesignerEarnings;
    private List<DesignerOrderResponse> recentOrders;
}
