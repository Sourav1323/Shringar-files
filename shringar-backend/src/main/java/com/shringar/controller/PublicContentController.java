package com.shringar.controller;

import com.shringar.dto.request.ArtistApplicationRequest;
import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.FileUploadResponse;
import com.shringar.model.Booking;
import com.shringar.model.Coupon;
import com.shringar.model.Testimonial;
import com.shringar.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Public (unauthenticated) endpoints for content shown on the customer site,
 * public artist applications, photo uploads, and 1-click admin email approvals.
 */
@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicContentController {

    private final AdminTestimonialService testimonialService;
    private final AdminCouponService couponService;
    private final AdminSettingsService settingsService;
    private final ArtistApplicationService artistApplicationService;
    private final FileStorageService fileStorageService;
    private final BookingService bookingService;

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

    /** POST /api/public/uploads — public image upload for "Become an Artist" applicants */
    @PostMapping(value = "/uploads", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<FileUploadResponse> uploadPublicImage(@RequestParam("file") MultipartFile file) {
        String relativeUrl = fileStorageService.storeImage(file);
        FileUploadResponse response = FileUploadResponse.builder()
                .fileName(file.getOriginalFilename())
                .url(relativeUrl)
                .sizeBytes(file.getSize())
                .build();
        return ApiResponse.success("Image uploaded successfully", response);
    }

    /** POST /api/public/artist-applications — "Become an Artist" form submission, no login required */
    @PostMapping("/artist-applications")
    public ResponseEntity<ApiResponse<Void>> submitArtistApplication(@Valid @RequestBody ArtistApplicationRequest request) {
        artistApplicationService.submit(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thank you! We'll review your application and reach out soon.", null));
    }

    /**
     * GET /api/public/bookings/{reference}/approve?token={token}
     * One-click approval link clicked by royal admin directly from the notification email.
     * No admin portal login required!
     */
    @GetMapping(value = "/bookings/{reference}/approve", produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public String approveBookingByEmail(
            @PathVariable("reference") String reference,
            @RequestParam("token") String token) {
        try {
            Booking booking = bookingService.approveBookingByToken(reference, token);
            return """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>Shringar — Booking Approved</title>
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #FAF7F2; margin: 0; padding: 24px; color: #2C160A; }
                    .card { max-width: 540px; margin: 40px auto; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #E6DFD3; overflow: hidden; }
                    .header { background: #4A2511; color: #FDFBF7; padding: 32px 28px; text-align: center; }
                    .content { padding: 32px 28px; }
                    .badge { display: inline-block; background: #DCFCE7; color: #166534; font-size: 12px; font-weight: bold; padding: 6px 14px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #86EFAC; margin-bottom: 16px; }
                    .details { background: #FDFBF7; border: 1px solid #E6DFD3; border-radius: 12px; padding: 18px; margin: 20px 0; font-size: 13px; line-height: 1.8; }
                    .btn { display: block; text-align: center; background: #B58E34; color: #FFFFFF; text-decoration: none; font-weight: bold; padding: 14px 28px; border-radius: 30px; margin-top: 24px; font-size: 14px; }
                    .btn:hover { background: #967428; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="header">
                      <h1 style="margin:0;font-size:22px;letter-spacing:0.05em;">✦ SHRINGAR LUXURY COUTURE ✦</h1>
                      <p style="margin:6px 0 0;font-size:12px;opacity:0.8;text-transform:uppercase;">Royal Executive One-Click Approval</p>
                    </div>
                    <div class="content">
                      <div class="badge">✓ Confirmed & Verified</div>
                      <h2 style="margin:0 0 8px;font-size:20px;color:#4A2511;">Booking Has Been Approved!</h2>
                      <p style="margin:0 0 16px;font-size:13px;color:#7A6356;line-height:1.6;">
                        Advance payment verified. Official confirmation email with ceremony schedule and master artist details has been dispatched to the patron.
                      </p>
                      <div class="details">
                        <div><strong>Booking ID:</strong> #SHR-%s</div>
                        <div><strong>Reference Code:</strong> %s</div>
                        <div><strong>Customer:</strong> %s · %s</div>
                        <div><strong>Ceremony Date:</strong> %s (%s)</div>
                        <div><strong>Grand Total:</strong> Rs. %s</div>
                        <div><strong>Advance Verified:</strong> Rs. %s</div>
                        <div><strong>Balance Due at Ceremony:</strong> Rs. %s</div>
                        <div><strong>Customer UTR:</strong> %s</div>
                      </div>
                      <a href="/admin/dashboard" class="btn">Open Admin Console Dashboard →</a>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(
                    booking.getId(),
                    booking.getBookingReference(),
                    booking.getCustomerName(),
                    booking.getCustomerPhone(),
                    booking.getAppointmentDate(),
                    booking.getPreferredTime(),
                    booking.getGrandTotal(),
                    booking.getAdvanceAmount(),
                    booking.getBalanceAmount(),
                    booking.getUpiTransactionRef() != null ? booking.getUpiTransactionRef() : "Verified via 1-Click Link"
            );
        } catch (Exception e) {
            return """
                <!DOCTYPE html>
                <html>
                <body style="font-family:sans-serif;background:#FAF7F2;padding:40px;text-align:center;">
                  <div style="max-width:480px;margin:0 auto;background:#fff;padding:32px;border-radius:16px;border:1px solid #fee2e2;">
                    <h2 style="color:#b91c1c;">Approval Error</h2>
                    <p style="font-size:14px;color:#555;">%s</p>
                    <a href="/admin/dashboard" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#4A2511;color:#fff;text-decoration:none;border-radius:20px;font-size:13px;">Go to Admin Portal</a>
                  </div>
                </body>
                </html>
                """.formatted(e.getMessage());
        }
    }
}
