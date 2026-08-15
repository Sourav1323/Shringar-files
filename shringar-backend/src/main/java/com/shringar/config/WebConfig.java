package com.shringar.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    /**
     * Maps GET /api/uploads/<filename> to the actual file on disk, so the
     * frontend can display uploaded design/artist photos directly via
     * <img src="http://localhost:8080/api/uploads/abc123.jpg">.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = Paths.get(uploadDir).toAbsolutePath().normalize().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + absolutePath + "/");
    }
}
