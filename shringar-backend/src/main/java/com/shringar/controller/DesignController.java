package com.shringar.controller;

import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.DesignResponse;
import com.shringar.service.DesignService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/designs")
@RequiredArgsConstructor
public class DesignController {

    private final DesignService designService;

    /** GET /api/designs — all active designs (home page grid). ?sortBy=popularity sorts by clicks descending. */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DesignResponse>>> getAll(
            @RequestParam(required = false) String sortBy) {
        return ResponseEntity.ok(ApiResponse.success(designService.getAllDesigns(sortBy)));
    }

    /**
     * POST /api/designs/{id}/click — public, no auth required.
     * Frontend fires this once whenever a design card is opened/clicked. Feeds the
     * admin portal's "Most Clicked Designs" widget and (when the homepage requests
     * ?sortBy=popularity) lets the most-engaged designs surface first automatically.
     */
    @PostMapping("/{id}/click")
    public ResponseEntity<ApiResponse<Void>> trackClick(@PathVariable Long id) {
        designService.trackClick(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /** GET /api/designs/featured — for the homepage carousel */
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<DesignResponse>>> getFeatured() {
        return ResponseEntity.ok(ApiResponse.success(designService.getFeaturedDesigns()));
    }

    /** GET /api/designs/category/{category} — filter pills (Bridal, Arabic, etc.) */
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<DesignResponse>>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(ApiResponse.success(designService.getByCategory(category)));
    }

    /** GET /api/designs/{id} — design detail page */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DesignResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(designService.getById(id)));
    }

    /**
     * GET /api/designs/suggest?skinTone=Wheatish&limit=4
     * Called by the AI Try-On modal after the vision/skin-tone detection step
     * resolves a tone string — ranks designs that list that tone as recommended.
     */
    @GetMapping("/suggest")
    public ResponseEntity<ApiResponse<List<DesignResponse>>> suggestForSkinTone(
            @RequestParam String skinTone,
            @RequestParam(defaultValue = "4") int limit) {
        return ResponseEntity.ok(ApiResponse.success(designService.suggestDesignsForSkinTone(skinTone, limit)));
    }
}
