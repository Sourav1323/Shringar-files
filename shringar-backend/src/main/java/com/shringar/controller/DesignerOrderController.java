package com.shringar.controller;

import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.DesignerOrderResponse;
import com.shringar.dto.response.DesignerPerformanceSummary;
import com.shringar.model.enums.PreferredTime;
import com.shringar.service.DesignerOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class DesignerOrderController {

    private final DesignerOrderService designerOrderService;

    /**
     * GET /api/public/designers/{id}/availability
     * Verifies whether a designer is free for a given date and slot with zero ambiguity.
     */
    @GetMapping("/public/designers/{id}/availability")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkDesignerAvailability(
            @PathVariable("id") Long designerId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam("slot") PreferredTime slot) {
        try {
            designerOrderService.validateDesignerAvailability(designerId, date, slot);
            return ResponseEntity.ok(ApiResponse.success("Designer is available for this slot", Map.of(
                    "designerId", designerId,
                    "date", date,
                    "slot", slot,
                    "isAvailable", true
            )));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("Designer is already booked", Map.of(
                    "designerId", designerId,
                    "date", date,
                    "slot", slot,
                    "isAvailable", false,
                    "reason", e.getMessage()
            )));
        }
    }

    /**
     * GET /api/admin/designers/summary
     * Returns an overview of all designers: order count, total earnings, and gross revenue.
     */
    @GetMapping("/admin/designers/summary")
    public ResponseEntity<ApiResponse<List<DesignerPerformanceSummary>>> getAllDesignersSummary() {
        return ResponseEntity.ok(ApiResponse.success(designerOrderService.getAllDesignersSummary()));
    }

    /**
     * GET /api/admin/designers/{id}/summary
     * Detailed performance and earnings for a single designer.
     */
    @GetMapping("/admin/designers/{id}/summary")
    public ResponseEntity<ApiResponse<DesignerPerformanceSummary>> getDesignerSummary(
            @PathVariable("id") Long designerId) {
        return ResponseEntity.ok(ApiResponse.success(designerOrderService.getDesignerSummary(designerId)));
    }

    /**
     * GET /api/admin/designers/{id}/orders
     * Lists every order handled by this designer with designs, dates, amounts, and statuses.
     */
    @GetMapping("/admin/designers/{id}/orders")
    public ResponseEntity<ApiResponse<List<DesignerOrderResponse>>> getDesignerOrders(
            @PathVariable("id") Long designerId) {
        return ResponseEntity.ok(ApiResponse.success(designerOrderService.getOrdersForDesigner(designerId)));
    }
}
