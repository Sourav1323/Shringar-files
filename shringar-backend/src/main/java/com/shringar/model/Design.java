package com.shringar.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "designs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Design {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String category;                // Bridal, Arabic, Rajasthani, Mughal, Minimal

    @Column(nullable = false, length = 80)
    private String coverage;               // e.g. "Full hand", "Both feet", "Half hand"

    @Column(name = "duration_min_hours")
    private Double durationMinHours;

    @Column(name = "duration_max_hours")
    private Double durationMaxHours;

    @Column(name = "cones_needed")
    private Double conesNeeded;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "palm_tier_price", precision = 10, scale = 2)
    private BigDecimal palmTierPrice;

    @Column(name = "grand_tier_price", precision = 10, scale = 2)
    private BigDecimal grandTierPrice;

    @Column(name = "origin_city", length = 60)
    private String originCity;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "design_cities", joinColumns = @JoinColumn(name = "design_id"))
    @Column(name = "city_name")
    @Builder.Default
    private List<String> availableCities = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "design_artist_ids", joinColumns = @JoinColumn(name = "design_id"))
    @Column(name = "artist_id")
    @Builder.Default
    private List<Long> assignedArtistIds = new ArrayList<>();

    @Column(name = "image_url")
    private String imageUrl;                // primary/cover image

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "design_gallery_images", joinColumns = @JoinColumn(name = "design_id"))
    @Column(name = "image_url", length = 500)
    @OrderColumn(name = "sort_order")
    @Builder.Default
    private List<String> galleryImageUrls = new ArrayList<>();   // additional angle photos shown on design-detail

    @Column(name = "youtube_video_url", length = 300)
    private String youtubeVideoUrl;          // e.g. a process/tutorial video for this design

    @Column(name = "emoji_icon", length = 10)
    private String emojiIcon;

    @Column(length = 30)
    private String badge;                  // Popular, New, Trending, Bridal, etc.

    @Column(name = "badge_color", length = 20)
    private String badgeColor;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "design_tags", joinColumns = @JoinColumn(name = "design_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "design_skin_tones", joinColumns = @JoinColumn(name = "design_id"))
    @Column(name = "skin_tone")
    @Builder.Default
    private List<String> recommendedSkinTones = new ArrayList<>();    // for AI try-on matching

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "click_count", nullable = false)
    @Builder.Default
    private Long clickCount = 0L;          // incremented via POST /designs/{id}/click — drives popularity sorting

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public String getDurationLabel() {
        if (durationMinHours == null && durationMaxHours == null) return "1–2 hrs";
        if (durationMinHours == null) return formatHour(durationMaxHours) + (durationMaxHours == 1.0 ? " hr" : " hrs");
        if (durationMaxHours == null || durationMinHours.equals(durationMaxHours)) {
            return formatHour(durationMinHours) + (durationMinHours == 1.0 ? " hr" : " hrs");
        }
        return formatHour(durationMinHours) + "–" + formatHour(durationMaxHours) + " hrs";
    }

    private String formatHour(Double h) {
        if (h == null) return "";
        if (h == Math.floor(h)) {
            return String.valueOf(h.intValue());
        }
        return String.valueOf(h);
    }
}
