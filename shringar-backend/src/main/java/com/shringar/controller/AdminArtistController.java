package com.shringar.controller;

import com.shringar.dto.request.AdminArtistRequest;
import com.shringar.dto.response.AdminArtistResponse;
import com.shringar.dto.response.ApiResponse;
import com.shringar.service.AdminArtistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** All endpoints here require ROLE_ADMIN — enforced globally by SecurityConfig's "/admin/**" rule. */
@RestController
@RequestMapping("/admin/artists")
@RequiredArgsConstructor
public class AdminArtistController {

    private final AdminArtistService adminArtistService;

    /** GET /api/admin/artists — every artist incl. deactivated ones, with email and management flags */
    @GetMapping
    public ApiResponse<List<AdminArtistResponse>> getAll() {
        return ApiResponse.success(adminArtistService.getAllForAdmin());
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminArtistResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(adminArtistService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminArtistResponse>> create(@Valid @RequestBody AdminArtistRequest request) {
        AdminArtistResponse created = adminArtistService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Artist added", created));
    }

    @PutMapping("/{id}")
    public ApiResponse<AdminArtistResponse> update(@PathVariable Long id, @Valid @RequestBody AdminArtistRequest request) {
        return ApiResponse.success("Artist updated", adminArtistService.update(id, request));
    }

    /** Soft-delete — artist disappears from public booking selection instantly, order history stays intact. */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        adminArtistService.delete(id);
        return ApiResponse.success("Artist removed from website", null);
    }

    /** Brings a previously-deleted artist back onto the live site. */
    @PatchMapping("/{id}/restore")
    public ApiResponse<AdminArtistResponse> restore(@PathVariable Long id) {
        return ApiResponse.success("Artist restored", adminArtistService.restore(id));
    }
}
