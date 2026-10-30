package com.shringar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Full design view for the admin portal — includes management fields the public API never exposes. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDesignResponse {
    private Long id;
    private String name;
    private String description;
    private String category;
    private String coverage;
    private Double durationMinHours;
    private Double durationMaxHours;
    private Double conesNeeded;
    private BigDecimal price;
    private BigDecimal palmTierPrice;
    private BigDecimal grandTierPrice;
    private String originCity;
    private List<String> availableCities;
    private List<Long> assignedArtistIds;
    private String imageUrl;
    private List<String> galleryImageUrls;
    private String youtubeVideoUrl;
    private String emojiIcon;
    private String badge;
    private String badgeColor;
    private Boolean isActive;
    private Boolean isFeatured;
    private List<String> tags;
    private List<String> recommendedSkinTones;
    private Integer sortOrder;
    private Long clickCount;
    private LocalDateTime createdAt;
}
