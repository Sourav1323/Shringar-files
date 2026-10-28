package com.shringar.controller;

import com.shringar.dto.response.AdminBookingResponse;
import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.BookingResponse;
import com.shringar.dto.response.DashboardStatsResponse;
import com.shringar.dto.response.PageResponse;
import com.shringar.dto.response.PopularDesignResponse;
import com.shringar.model.enums.BookingStatus;
import com.shringar.service.AdminDashboardService;
import com.shringar.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** All endpoints here require ROLE_ADMIN — enforced globally by SecurityConfig's "/admin/**" rule. */
@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;
    private final BookingService bookingService;

    /** GET /api/admin/dashboard/stats — total orders, total order value, total advance received, etc. */
    @GetMapping("/stats")
    public ApiResponse<DashboardStatsResponse> getStats() {
        return ApiResponse.success(adminDashboardService.getStats());
    }

    /** GET /api/admin/dashboard/popular-designs — top 10 by click count, drives "show what's clicked most first" */
    @GetMapping("/popular-designs")
    public ApiResponse<List<PopularDesignResponse>> getPopularDesigns() {
        return ApiResponse.success(adminDashboardService.getMostPopularDesigns());
    }

    /** GET /api/admin/dashboard/orders?page=0&size=20&status=CONFIRMED — paginated order list with full customer detail */
    @GetMapping("/orders")
    public ApiResponse<PageResponse<AdminBookingResponse>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) BookingStatus status) {
        return ApiResponse.success(adminDashboardService.getOrders(page, size, status));
    }

    /**
     * PATCH /api/admin/dashboard/orders/{id}/confirm-upi-payment
     * Admin has manually checked their UPI app/bank statement and confirms the
     * advance genuinely arrived — this is the manual equivalent of what a
     * payment gateway webhook would normally do automatically.
     */
    @PatchMapping("/orders/{id}/confirm-upi-payment")
    public ApiResponse<BookingResponse> confirmUpiPayment(@PathVariable Long id) {
        return ApiResponse.success("Payment confirmed — booking is now confirmed", bookingService.confirmUpiPayment(id));
    }

    /**
     * POST /api/admin/dashboard/orders/{id}/cancel
     * Admin initiates booking cancellation and immediately triggers 100% full customer refund.
     */
    @PostMapping("/orders/{id}/cancel")
    public ApiResponse<BookingResponse> adminCancelBooking(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String reason = body != null ? body.get("reason") : "Administrative cancellation";
        return ApiResponse.success("Booking cancelled and 100% full refund initiated", bookingService.adminCancelBooking(id, reason));
    }

    /**
     * POST /api/admin/dashboard/orders/{id}/approve-refund
     * Admin approves a customer's refund request.
     */
    @PostMapping("/orders/{id}/approve-refund")
    public ApiResponse<BookingResponse> adminApproveRefund(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String notes = body != null ? body.get("notes") : "Approved by administrator";
        return ApiResponse.success("Refund approved and processed", bookingService.adminApproveRefund(id, notes));
    }

    /**
     * POST /api/admin/dashboard/orders/{id}/reject-refund
     * Admin rejects a customer's refund request with explanation.
     */
    @PostMapping("/orders/{id}/reject-refund")
    public ApiResponse<BookingResponse> adminRejectRefund(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String reason = body != null ? body.get("reason") : "Cancellation outside free-cancellation policy";
        return ApiResponse.success("Refund request rejected", bookingService.adminRejectRefund(id, reason));
    }
}
