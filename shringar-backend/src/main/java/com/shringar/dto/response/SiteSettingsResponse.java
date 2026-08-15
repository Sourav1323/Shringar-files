package com.shringar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteSettingsResponse {
    private String instagramHandle;
    private String instagramUrl;
    private String youtubeChannelUrl;
    private String youtubeIntroVideoUrl;
    private String facebookUrl;
    private String whatsappNumber;
    private String contactPhone;
    private String contactEmail;

    // Homepage text — returned to the customer site so it can render dynamic content
    private String heroTitle;
    private String heroSubtitle;
    private String heroCtaText;
    private String aboutTagline;

    // Announcement banner
    private String announcementBanner;
    private Boolean announcementActive;

    // Business rules (read-only for frontend — for display purposes)
    private Integer advancePercent;
    private java.math.BigDecimal artistVisitFee;
}
