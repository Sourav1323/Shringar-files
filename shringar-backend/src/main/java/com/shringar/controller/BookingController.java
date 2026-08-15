package com.shringar.controller;

import com.shringar.dto.request.CancelBookingRequest;
import com.shringar.dto.request.CreateBookingRequest;
import com.shringar.dto.request.RescheduleBookingRequest;
import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.BookingResponse;
import com.shringar.security.CurrentUserResolver;
import com.shringar.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final CurrentUserResolver currentUser;

    /** POST /api/bookings — creates booking from current cart, status=PENDING until advance paid */
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody CreateBookingRequest request) {
        BookingResponse booking = bookingService.createBooking(currentUser.getCurrentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created — pay advance to confirm", booking));
    }

    /** GET /api/bookings — all bookings for the logged-in user */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings() {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getUserBookings(currentUser.getCurrentUserId())));
    }

    /** GET /api/bookings/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBooking(currentUser.getCurrentUserId(), id)));
    }

    /** GET /api/bookings/reference/{ref} — e.g. SH-2026-4821, used on the order-confirmation page */
    @GetMapping("/reference/{ref}")
    public ResponseEntity<ApiResponse<BookingResponse>> getByReference(@PathVariable String ref) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getByReference(ref)));
    }

    /** PATCH /api/bookings/{id}/cancel — free if >48hrs out, else advance is forfeited */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            @RequestBody(required = false) CancelBookingRequest request) {
        CancelBookingRequest body = request != null ? request : new CancelBookingRequest();
        BookingResponse booking = bookingService.cancelBooking(currentUser.getCurrentUserId(), id, body);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled", booking));
    }

    /**
     * PATCH /api/bookings/{id}/reschedule
     * Moves the booking to a new date. The advance payment carries over — no charge.
     * Only allowed while the booking is CONFIRMED or PENDING, and at least 24 hours
     * before the current appointment time.
     */
    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<BookingResponse>> rescheduleBooking(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleBookingRequest request) {
        BookingResponse booking = bookingService.rescheduleBooking(currentUser.getCurrentUserId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Booking rescheduled to " + request.getNewDate(), booking));
    }

    @PatchMapping("/{id}/confirm-fulfillment")
    public ResponseEntity<ApiResponse<BookingResponse>> confirmFulfillment(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, Object> body) {
        int rating = body != null && body.containsKey("rating") ? ((Number) body.get("rating")).intValue() : 0;
        String feedback = body != null ? (String) body.get("feedback") : null;
        BookingResponse booking = bookingService.customerConfirmFulfillment(currentUser.getCurrentUserId(), id, rating, feedback);
        return ResponseEntity.ok(ApiResponse.success("Thank you for confirming!", booking));
    }
}
