package com.shringar.service;

import com.shringar.model.SiteSettings;
import com.shringar.repository.SiteSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminSettingsService {

    private final SiteSettingsRepository siteSettingsRepository;

    public SiteSettings getSettings() {
        return siteSettingsRepository.findAll().stream().findFirst()
                .orElseGet(() -> siteSettingsRepository.save(SiteSettings.builder().build()));
    }

    @Transactional
    public SiteSettings updateSettings(Map<String, Object> updates) {
        SiteSettings s = getSettings();

        // ── Social / Contact ──
        if (updates.containsKey("instagramHandle")) s.setInstagramHandle((String) updates.get("instagramHandle"));
        if (updates.containsKey("instagramUrl"))    s.setInstagramUrl((String) updates.get("instagramUrl"));
        if (updates.containsKey("youtubeChannelUrl")) s.setYoutubeChannelUrl((String) updates.get("youtubeChannelUrl"));
        if (updates.containsKey("youtubeIntroVideoUrl")) s.setYoutubeIntroVideoUrl((String) updates.get("youtubeIntroVideoUrl"));
        if (updates.containsKey("facebookUrl"))     s.setFacebookUrl((String) updates.get("facebookUrl"));
        if (updates.containsKey("whatsappNumber"))  s.setWhatsappNumber((String) updates.get("whatsappNumber"));
        if (updates.containsKey("contactPhone"))    s.setContactPhone((String) updates.get("contactPhone"));
        if (updates.containsKey("contactEmail"))    s.setContactEmail((String) updates.get("contactEmail"));

        // ── Homepage Text ──
        if (updates.containsKey("heroTitle"))       s.setHeroTitle((String) updates.get("heroTitle"));
        if (updates.containsKey("heroSubtitle"))    s.setHeroSubtitle((String) updates.get("heroSubtitle"));
        if (updates.containsKey("heroCtaText"))     s.setHeroCtaText((String) updates.get("heroCtaText"));
        if (updates.containsKey("aboutTagline"))    s.setAboutTagline((String) updates.get("aboutTagline"));

        // ── Business Rules ──
        if (updates.containsKey("advancePercent")) {
            int pct = ((Number) updates.get("advancePercent")).intValue();
            if (pct < 1 || pct > 100) throw new com.shringar.exception.BadRequestException("advancePercent must be between 1 and 100");
            s.setAdvancePercent(pct);
        }
        if (updates.containsKey("minOrderForAdvance"))
            s.setMinOrderForAdvance(new BigDecimal(updates.get("minOrderForAdvance").toString()));
        if (updates.containsKey("freeCancelHours"))
            s.setFreeCancelHours(((Number) updates.get("freeCancelHours")).intValue());
        if (updates.containsKey("rescheduleHours"))
            s.setRescheduleHours(((Number) updates.get("rescheduleHours")).intValue());
        if (updates.containsKey("artistVisitFee"))
            s.setArtistVisitFee(new BigDecimal(updates.get("artistVisitFee").toString()));

        // ── Time Slots ──
        if (updates.containsKey("availableTimeSlots"))
            s.setAvailableTimeSlots((String) updates.get("availableTimeSlots"));
        if (updates.containsKey("blackoutDays"))
            s.setBlackoutDays((String) updates.get("blackoutDays"));

        // ── Announcement ──
        if (updates.containsKey("announcementBanner"))
            s.setAnnouncementBanner((String) updates.get("announcementBanner"));
        if (updates.containsKey("announcementActive"))
            s.setAnnouncementActive((Boolean) updates.get("announcementActive"));

        return siteSettingsRepository.save(s);
    }

    /** Returns time slots as a list for the frontend */
    public List<String> getTimeSlots() {
        SiteSettings s = getSettings();
        if (s.getAvailableTimeSlots() == null || s.getAvailableTimeSlots().isBlank()) return List.of();
        return Arrays.asList(s.getAvailableTimeSlots().split(","));
    }
}
