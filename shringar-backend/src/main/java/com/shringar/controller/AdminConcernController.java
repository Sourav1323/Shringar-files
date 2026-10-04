package com.shringar.controller;

import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.ConcernResponse;
import com.shringar.security.CurrentUserResolver;
import com.shringar.service.CustomerConcernService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/concerns")
@RequiredArgsConstructor
public class AdminConcernController {

    private final CustomerConcernService concernService;
    private final CurrentUserResolver currentUser;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ConcernResponse>>> getAllConcerns(
            @RequestParam(required = false) String status) {
        List<ConcernResponse> list = concernService.getAllConcerns(status);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ConcernResponse>> getConcernById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(concernService.getConcernById(id)));
    }

    @PatchMapping("/{id}/respond")
    public ResponseEntity<ApiResponse<ConcernResponse>> respondToConcern(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String response = null;
        if (body != null) {
            if (body.get("response") != null) response = body.get("response").toString();
            else if (body.get("adminResponse") != null) response = body.get("adminResponse").toString();
            else if (body.get("message") != null) response = body.get("message").toString();
        }
        String status = (body != null && body.get("status") != null) ? body.get("status").toString() : "RESOLVED";
        String adminName = "Support Team";
        try {
            var user = currentUser.getCurrentUser();
            if (user != null && user.getFirstName() != null && !user.getFirstName().isBlank()) {
                adminName = user.getFirstName() + " (Admin)";
            } else {
                adminName = "Shringar Admin";
            }
        } catch (Exception ignored) {
            adminName = "Shringar Admin";
        }

        ConcernResponse updated = concernService.respondToConcern(id, response, status, adminName);
        return ResponseEntity.ok(ApiResponse.success("Response recorded and concern status updated", updated));
    }
}
