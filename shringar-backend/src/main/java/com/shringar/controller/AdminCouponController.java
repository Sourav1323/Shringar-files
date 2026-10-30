package com.shringar.controller;

import com.shringar.dto.response.ApiResponse;
import com.shringar.model.Coupon;
import com.shringar.service.AdminCouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AdminCouponController {

    private final AdminCouponService adminCouponService;

    /** Public — returns active coupons so main website can show them in cart / checkout */
    @GetMapping("/coupons/public")
    public ApiResponse<List<Coupon>> getPublicCoupons() {
        return ApiResponse.success(adminCouponService.getPublicCoupons());
    }

    /** Public — validate coupon eligibility and calculate discount amount */
    @GetMapping("/coupons/validate")
    public ApiResponse<Map<String, Object>> validateCoupon(
            @RequestParam String code,
            @RequestParam(required = false, defaultValue = "0") java.math.BigDecimal amount) {
        return ApiResponse.success("Coupon is valid", adminCouponService.validateCoupon(code, amount));
    }

    /** Admin — full list including inactive/expired ones */
    @GetMapping("/admin/coupons")
    public ApiResponse<List<Coupon>> getAllCoupons() {
        return ApiResponse.success(adminCouponService.getAllCoupons());
    }

    @PostMapping("/admin/coupons")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Coupon> create(@RequestBody Map<String, Object> data) {
        return ApiResponse.success("Coupon created", adminCouponService.createCoupon(data));
    }

    @PatchMapping("/admin/coupons/{id}/toggle")
    public ApiResponse<Coupon> toggleActive(@PathVariable Long id) {
        return ApiResponse.success("Coupon updated", adminCouponService.toggleActive(id));
    }

    @DeleteMapping("/admin/coupons/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        adminCouponService.deleteCoupon(id);
        return ApiResponse.success("Coupon deleted", null);
    }
}
