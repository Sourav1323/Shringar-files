package com.shringar.service;

import com.shringar.dto.response.SiteSettingsResponse;
import com.shringar.model.SiteSettings;
import com.shringar.repository.SiteSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SiteSettingsService {

    private final SiteSettingsRepository siteSettingsRepository;

    public SiteSettingsResponse getSettings() {
        SiteSettings s = siteSettingsRepository.findAll().stream().findFirst()
                .orElseGet(() -> siteSettingsRepository.save(SiteSettings.builder().build()));

        return SiteSettingsResponse.builder()
                .instagramHandle(s.getInstagramHandle())
                .instagramUrl(resolveInstagramUrl(s))
                .youtubeChannelUrl(s.getYoutubeChannelUrl())
                .youtubeIntroVideoUrl(s.getYoutubeIntroVideoUrl())
                .facebookUrl(s.getFacebookUrl())
                .whatsappNumber(s.getWhatsappNumber())
                .contactPhone(s.getContactPhone())
                .contactEmail(s.getContactEmail())
                .heroTitle(s.getHeroTitle())
                .heroSubtitle(s.getHeroSubtitle())
                .heroCtaText(s.getHeroCtaText())
                .aboutTagline(s.getAboutTagline())
                .announcementBanner(s.getAnnouncementBanner())
                .announcementActive(s.getAnnouncementActive())
                .advancePercent(s.getAdvancePercent())
                .artistVisitFee(s.getArtistVisitFee())
                .build();
    }

    private String resolveInstagramUrl(SiteSettings s) {
        if (s.getInstagramUrl() != null && !s.getInstagramUrl().isBlank())
            return s.getInstagramUrl();
        if (s.getInstagramHandle() != null && !s.getInstagramHandle().isBlank())
            return "https://instagram.com/" + s.getInstagramHandle();
        return null;
    }
}
