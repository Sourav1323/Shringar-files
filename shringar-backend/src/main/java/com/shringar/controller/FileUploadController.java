package com.shringar.controller;

import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.FileUploadResponse;
import com.shringar.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin/uploads")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    /**
     * POST /api/admin/uploads (multipart/form-data, field name "file")
     * Restricted to ROLE_ADMIN via SecurityConfig's "/admin/**" rule.
     * Returns a relative URL — prefix with the API host when displaying,
     * e.g. http://localhost:8080/api + the returned url.
     */
    @PostMapping
    public ApiResponse<FileUploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        String relativeUrl = fileStorageService.storeImage(file);
        FileUploadResponse response = FileUploadResponse.builder()
                .fileName(file.getOriginalFilename())
                .url(relativeUrl)
                .sizeBytes(file.getSize())
                .build();
        return ApiResponse.success("Image uploaded successfully", response);
    }
}
