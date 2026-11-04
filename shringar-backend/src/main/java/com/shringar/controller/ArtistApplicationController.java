package com.shringar.controller;

import com.shringar.dto.request.ArtistApplicationRequest;
import com.shringar.dto.response.ApiResponse;
import com.shringar.service.ArtistApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/artist-applications")
@RequiredArgsConstructor
public class ArtistApplicationController {

    private final ArtistApplicationService artistApplicationService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> submitArtistApplication(@Valid @RequestBody ArtistApplicationRequest request) {
        artistApplicationService.submit(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thank you! We'll review your application and reach out soon.", null));
    }
}
