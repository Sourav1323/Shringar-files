package com.shringar.controller;

import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.CityResponse;
import com.shringar.service.CityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cities")
@RequiredArgsConstructor
public class CityController {

    private final CityService cityService;

    /** GET /api/cities — powers the city cards + map on the booking page */
    @GetMapping
    public ApiResponse<List<CityResponse>> getAllCities() {
        return ApiResponse.success(cityService.getAllCities());
    }

    /** GET /api/cities/active — only Mumbai/Pune/Nashik, no "coming soon" */
    @GetMapping("/active")
    public ApiResponse<List<CityResponse>> getActiveCities() {
        return ApiResponse.success(cityService.getActiveCities());
    }

    /** GET /api/cities/{name} — returns city + its list of areas */
    @GetMapping("/{name}")
    public ApiResponse<CityResponse> getCity(@PathVariable String name) {
        return ApiResponse.success(cityService.getCityByName(name));
    }
}
