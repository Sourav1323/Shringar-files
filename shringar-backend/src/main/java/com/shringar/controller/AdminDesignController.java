package com.shringar.controller;

import com.shringar.dto.request.AdminDesignRequest;
import com.shringar.dto.response.AdminDesignResponse;
import com.shringar.dto.response.ApiResponse;
import com.shringar.service.AdminDesignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** All endpoints here require ROLE_ADMIN — enforced globally by SecurityConfig's "/admin/**" rule. */
@RestController
@RequestMapping("/admin/designs")
@RequiredArgsConstructor
public class AdminDesignController {

    private final AdminDesignService adminDesignService;

    /** GET /api/admin/designs — every design incl. deactivated ones, with click counts and management flags */
    @GetMapping
    public ApiResponse<List<AdminDesignResponse>> getAll() {
        return ApiResponse.success(adminDesignService.getAllForAdmin());
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminDesignResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(adminDesignService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminDesignResponse>> create(@Valid @RequestBody AdminDesignRequest request) {
        AdminDesignResponse created = adminDesignService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Design created", created));
    }

    @PutMapping("/{id}")
    public ApiResponse<AdminDesignResponse> update(@PathVariable Long id, @Valid @RequestBody AdminDesignRequest request) {
        return ApiResponse.success("Design updated", adminDesignService.update(id, request));
    }

    /** Soft-delete — design disappears from the live site instantly, order history stays intact. */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        adminDesignService.delete(id);
        return ApiResponse.success("Design removed from website", null);
    }

    /** Brings a previously-deleted design back onto the live site. */
    @PatchMapping("/{id}/restore")
    public ApiResponse<AdminDesignResponse> restore(@PathVariable Long id) {
        return ApiResponse.success("Design restored", adminDesignService.restore(id));
    }
}
