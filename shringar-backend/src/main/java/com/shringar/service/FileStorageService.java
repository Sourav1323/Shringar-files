package com.shringar.service;

import com.shringar.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    private static final List<String> ALLOWED_TYPES =
            List.of("image/jpeg", "image/png", "image/webp", "image/jpg");
    private static final long MAX_SIZE_BYTES = 10L * 1024 * 1024; // 10MB, matches application.properties

    /**
     * Saves an uploaded image to disk under a random UUID filename (avoids
     * collisions/overwrites and avoids trusting the original filename).
     * Returns the relative URL the frontend should use, e.g. "/api/uploads/<uuid>.jpg".
     */
    public String storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file was uploaded");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Only JPG, PNG or WEBP images are allowed");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BadRequestException("Image must be smaller than 10MB");
        }

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image";
            String extension = originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf('.'))
                    : guessExtension(file.getContentType());

            String storedName = UUID.randomUUID() + extension;
            Path targetPath = uploadPath.resolve(storedName);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Stored uploaded image: {}", storedName);
            return "/uploads/" + storedName;

        } catch (IOException e) {
            throw new BadRequestException("Could not save the uploaded file: " + e.getMessage());
        }
    }

    private String guessExtension(String contentType) {
        if (contentType == null) return ".jpg";
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }
}
