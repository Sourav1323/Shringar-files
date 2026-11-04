package com.shringar.controller;

import com.shringar.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping({"/admin/uploads", "/public/uploads", "/uploads"})
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    /**
     * POST /api/public/uploads, /api/admin/uploads, or /api/uploads (multipart/form-data, field name "file")
     * Accepts image uploads (PNG, JPG, JPEG, WEBP up to 10MB) for:
     * - Customer UPI payment approval screenshots / receipts
     * - Artist application sample design photos
     * - Admin catalog / banner uploads
     *
     * Returns JSON containing both top-level 'url' and nested 'data.url' to support all callers:
     * {
     *   "success": true,
     *   "message": "Image uploaded successfully",
     *   "url": "/uploads/<uuid>.<ext>",
     *   "data": {
     *     "fileName": "example.png",
     *     "url": "/uploads/<uuid>.<ext>",
     *     "sizeBytes": 12345
     *   }
     * }
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> uploadImage(@RequestParam("file") MultipartFile file) {
        String relativeUrl = fileStorageService.storeImage(file);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("fileName", file.getOriginalFilename());
        data.put("url", relativeUrl);
        data.put("sizeBytes", file.getSize());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", "Image uploaded successfully");
        body.put("url", relativeUrl);
        body.put("data", data);

        return ResponseEntity.ok(body);
    }
}
