package com.shringar.controller;

import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.ArtistResponse;
import com.shringar.service.ArtistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/artists")
@RequiredArgsConstructor
public class ArtistController {

    private final ArtistService artistService;

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
}
