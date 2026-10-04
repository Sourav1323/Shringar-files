package com.shringar.controller;

import com.shringar.dto.request.ArtistApplicationRequest;
import com.shringar.dto.response.ApiResponse;
import com.shringar.model.Coupon;
import com.shringar.model.Testimonial;
import com.shringar.service.AdminCouponService;
import com.shringar.service.AdminSettingsService;
import com.shringar.service.AdminTestimonialService;
import com.shringar.service.ArtistApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public (unauthenticated) read-only endpoints for content shown on the customer site.
 */
@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicContentController {

    private final AdminTestimonialService testimonialService;
    private final AdminCouponService couponService;
    private final AdminSettingsService settingsService;
    private final ArtistApplicationService artistApplicationService;

    /** GET /api/public/testimonials — homepage reviews */
    @GetMapping("/testimonials")
    public ApiResponse<List<Testimonial>> getTestimonials() {
        return ApiResponse.success(testimonialService.getPublic());
    }

    /** GET /api/public/coupons — active coupons shown in cart + booking page */
    @GetMapping("/coupons")
    public ApiResponse<List<Coupon>> getActiveCoupons() {
        return ApiResponse.success(couponService.getPublicCoupons());
    }

    /** GET /api/public/time-slots — available appointment times shown on booking page */
    @GetMapping("/time-slots")
    public ApiResponse<List<String>> getTimeSlots() {
        return ApiResponse.success(settingsService.getTimeSlots());
    }

    /** POST /api/public/artist-applications — "Become an Artist" form submission, no login required */
    @PostMapping("/artist-applications")
    public ResponseEntity<ApiResponse<Void>> submitArtistApplication(@Valid @RequestBody ArtistApplicationRequest request) {
        artistApplicationService.submit(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thank you! We'll review your application and reach out soon.", null));
    }
}
