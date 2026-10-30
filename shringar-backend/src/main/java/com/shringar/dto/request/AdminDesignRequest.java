package com.shringar.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/** Used for both POST (create) and PUT (update) of a design from the admin portal. */
@Data
public class AdminDesignRequest {

    @NotBlank(message = "Design name is required")
    private String name;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Coverage is required")
    private String coverage;

    private Double durationMinHours;
    private Double durationMaxHours;
    private Double conesNeeded;

    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price cannot be negative")
    private BigDecimal price;

    private BigDecimal originalPrice;
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
}
