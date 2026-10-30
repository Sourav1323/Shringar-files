package com.shringar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** Full artist view for the admin portal — includes email and management flags the public API never exposes. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminArtistResponse {
    private Long id;
    private String name;
    private String specialization;
    private String city;
    private List<String> serviceAreas;
    private Double rating;
    private Integer reviewCount;
    private String avatarEmoji;
    private String profileImageUrl;
    private List<String> portfolioImageUrls;
    private String instagramHandle;
    private String youtubeChannelUrl;
    private String email;
    private Integer experienceYears;
    private Boolean isActive;
    private Boolean isTopArtist;
    private String badgeLabel;
    private Boolean isAvailable;
    private java.time.LocalDateTime availabilityLockedUntil;
    private java.time.LocalDateTime availabilityLastChangedAt;
    private Boolean isAvailabilityLocked;
}
