package com.shringar.controller;

import com.shringar.dto.response.ApiResponse;
import com.shringar.model.SiteSettings;
import com.shringar.service.AdminSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/settings")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final AdminSettingsService adminSettingsService;

    @GetMapping
    public ApiResponse<SiteSettings> get() {
        return ApiResponse.success(adminSettingsService.getSettings());
    }

    @PatchMapping
    public ApiResponse<SiteSettings> update(@RequestBody Map<String, Object> updates) {
        return ApiResponse.success("Settings updated", adminSettingsService.updateSettings(updates));
    }

    @GetMapping("/time-slots")
    public ApiResponse<List<String>> getTimeSlots() {
        return ApiResponse.success(adminSettingsService.getTimeSlots());
    }
}
