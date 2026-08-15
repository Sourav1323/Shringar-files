package com.shringar.controller;

import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.SiteSettingsResponse;
import com.shringar.service.SiteSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
public class SiteSettingsController {

    private final SiteSettingsService siteSettingsService;

    /** GET /api/settings — Instagram/YouTube/WhatsApp links the frontend footer reads on every page load */
    @GetMapping
    public ApiResponse<SiteSettingsResponse> getSettings() {
        return ApiResponse.success(siteSettingsService.getSettings());
    }
}
