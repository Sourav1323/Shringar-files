package com.shringar.controller;

import com.shringar.dto.request.CreateCustomRequest;
import com.shringar.dto.request.QuoteCustomRequest;
import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.CustomRequestResponse;
import com.shringar.service.CustomRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/custom-requests")
@RequiredArgsConstructor
public class CustomRequestController {

    private final CustomRequestService customRequestService;

    /** POST /api/custom-requests — submit a new custom design commission */
    @PostMapping
    public ResponseEntity<ApiResponse<CustomRequestResponse>> createCustomRequest(
            @Valid @RequestBody CreateCustomRequest request) {
        CustomRequestResponse res = customRequestService.createCustomRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Custom design request submitted successfully", res));
    }

    /** GET /api/custom-requests — list all or filter by customer email/phone */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomRequestResponse>>> getCustomRequests(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone) {
        if (email != null || phone != null) {
            return ResponseEntity.ok(ApiResponse.success(customRequestService.getCustomerRequests(email, phone)));
        }
        return ResponseEntity.ok(ApiResponse.success(customRequestService.getAllCustomRequests()));
    }

    /** GET /api/custom-requests/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomRequestResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(customRequestService.getCustomRequest(id)));
    }

    /** GET /api/custom-requests/reference/{ref} */
    @GetMapping("/reference/{ref}")
    public ResponseEntity<ApiResponse<CustomRequestResponse>> getByReference(@PathVariable String ref) {
        return ResponseEntity.ok(ApiResponse.success(customRequestService.getByReference(ref)));
    }

    /** PATCH /api/custom-requests/{id}/quote — admin quote */
    @PatchMapping("/{id}/quote")
    public ResponseEntity<ApiResponse<CustomRequestResponse>> quoteCustomRequest(
            @PathVariable Long id,
            @Valid @RequestBody QuoteCustomRequest quote) {
        return ResponseEntity.ok(ApiResponse.success("Quote submitted successfully", customRequestService.quoteCustomRequest(id, quote)));
    }

    /** PATCH /api/custom-requests/{id}/reject — admin reject */
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<CustomRequestResponse>> rejectCustomRequest(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(ApiResponse.success("Custom request rejected", customRequestService.rejectCustomRequest(id, reason)));
    }
}
