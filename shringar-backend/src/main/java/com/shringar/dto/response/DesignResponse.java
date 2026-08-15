package com.shringar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesignResponse {
    private Long id;
    private String name;
    private String description;
    private String category;
    private String coverage;
    private String durationLabel;
    private Double conesNeeded;
    private BigDecimal price;
    private String imageUrl;
    private List<String> galleryImageUrls;
    private String youtubeVideoUrl;
    private String emojiIcon;
    private String badge;
    private List<String> tags;
    private List<String> recommendedSkinTones;
}
