package com.shringar.controller;

import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.ArtistResponse;
import com.shringar.security.CurrentUserResolver;
import com.shringar.service.ArtistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/artists")
@RequiredArgsConstructor
public class ArtistController {

    private final ArtistService artistService;
    private final CurrentUserResolver currentUser;

    /** GET /api/artists/me — profile for the currently logged-in artist */
    @GetMapping("/me")
    public ApiResponse<ArtistResponse> getMyArtistProfile() {
        Long userId = currentUser.getCurrentUserId();
        return ApiResponse.success(artistService.getByUserId(userId));
    }

    /** PATCH /api/artists/me/availability — toggles availability with 15-day commitment rule */
    @PatchMapping("/me/availability")
    public ApiResponse<ArtistResponse> toggleMyAvailability(
            @RequestBody java.util.Map<String, Boolean> body) {
        Long userId = currentUser.getCurrentUserId();
        ArtistResponse myProfile = artistService.getByUserId(userId);
        Boolean isAvailable = body.get("isAvailable");
        return ApiResponse.success("Availability updated", artistService.toggleAvailability(myProfile.getId(), isAvailable, false));
    }

    /** GET /api/artists?city=Mumbai — used to populate the artist list on the booking page */
    @GetMapping
    public ApiResponse<List<ArtistResponse>> getByCity(@RequestParam(required = false) String city) {
        return ApiResponse.success(artistService.getByCity(city));
    }

    /** GET /api/artists/search?city=Mumbai&area=Andheri — narrows to artists serving that exact area */
    @GetMapping("/search")
    public ApiResponse<List<ArtistResponse>> search(
            @RequestParam String city,
            @RequestParam String area) {
        return ApiResponse.success(artistService.getByCityAndArea(city, area));
    }

    /** GET /api/artists/{id} */
    @GetMapping("/{id}")
    public ApiResponse<ArtistResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(artistService.getById(id));
    }

    /** PATCH /api/artists/{id}/availability — enforces 15-day lock rule */
    @PatchMapping("/{id}/availability")
    public ApiResponse<ArtistResponse> toggleAvailability(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Boolean> body) {
        Boolean isAvailable = body.get("isAvailable");
        return ApiResponse.success("Artist availability updated", artistService.toggleAvailability(id, isAvailable, false));
    }
}
