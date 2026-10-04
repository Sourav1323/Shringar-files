package com.shringar.controller;

import com.shringar.dto.response.ApiResponse;
import com.shringar.model.ArtistApplication;
import com.shringar.service.ArtistApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Secured by /admin/** → ROLE_ADMIN in SecurityConfig. */
@RestController
@RequestMapping("/admin/artist-applications")
@RequiredArgsConstructor
public class AdminArtistApplicationController {

    private final ArtistApplicationService service;

    @GetMapping
    public ApiResponse<List<ArtistApplication>> getAll() {
        return ApiResponse.success(service.getAll());
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<ArtistApplication> updateStatus(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        String status = (String) data.get("status");
        String notes = (String) data.get("adminNotes");
        return ApiResponse.success("Application updated", service.updateStatus(id, status, notes));
    }
}
