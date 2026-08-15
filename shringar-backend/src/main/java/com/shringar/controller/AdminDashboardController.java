package com.shringar.controller;

import com.shringar.dto.response.AdminBookingResponse;
import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.DashboardStatsResponse;
import com.shringar.dto.response.PageResponse;
import com.shringar.dto.response.PopularDesignResponse;
import com.shringar.model.enums.BookingStatus;
import com.shringar.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** All endpoints here require ROLE_ADMIN — enforced globally by SecurityConfig's "/admin/**" rule. */
@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

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
}
