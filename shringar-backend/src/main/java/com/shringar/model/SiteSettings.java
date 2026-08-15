package com.shringar.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Single-row table — all site-wide configurable content.
 * Admins manage everything here without touching code.
 */
@Entity
@Table(name = "site_settings")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SiteSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Social / Contact ──
    @Column(name = "instagram_handle", length = 60)
    private String instagramHandle;

    @Column(name = "instagram_url", length = 300)
    private String instagramUrl;

    @Column(name = "youtube_channel_url", length = 300)
    private String youtubeChannelUrl;

    @Column(name = "youtube_intro_video_url", length = 300)
    private String youtubeIntroVideoUrl;

    @Column(name = "facebook_url", length = 300)
    private String facebookUrl;

    @Column(name = "whatsapp_number", length = 20)
    private String whatsappNumber;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "contact_email", length = 100)
    private String contactEmail;

    // ── Hero / Homepage Text ──
    @Column(name = "hero_title", length = 200)
    @Builder.Default
    private String heroTitle = "मेहंदी कला for Every Celebration";

    @Column(name = "hero_subtitle", columnDefinition = "TEXT")
    @Builder.Default
    private String heroSubtitle = "Book India's finest mehendi artists for your home, venue or event.";

    @Column(name = "hero_cta_text", length = 60)
    @Builder.Default
    private String heroCtaText = "Book Your Artist";

    @Column(name = "about_tagline", columnDefinition = "TEXT")
    private String aboutTagline;

    // ── Business Rules ──
    /** Advance payment percentage (1–100). Default 30. */
    @Column(name = "advance_percent")
    @Builder.Default
    private Integer advancePercent = 30;

    /** Minimum order value in rupees before advance is collected. Default 0. */
    @Column(name = "min_order_for_advance", precision = 10, scale = 2)
    @Builder.Default
    private java.math.BigDecimal minOrderForAdvance = java.math.BigDecimal.ZERO;

    /** Free-cancellation window in hours. Default 48. */
    @Column(name = "free_cancel_hours")
    @Builder.Default
    private Integer freeCancelHours = 48;

    /** Rescheduling notice in hours. Default 24. */
    @Column(name = "reschedule_hours")
    @Builder.Default
    private Integer rescheduleHours = 24;

    /** Artist visit/travel fee added to every booking. Default 200. */
    @Column(name = "artist_visit_fee", precision = 10, scale = 2)
    @Builder.Default
    private java.math.BigDecimal artistVisitFee = new java.math.BigDecimal("200.00");

    // ── Time Slots (stored as comma-separated "HH:mm" strings) ──
    @Column(name = "available_time_slots", columnDefinition = "TEXT")
    @Builder.Default
    private String availableTimeSlots = "09:00,10:00,11:00,12:00,13:00,14:00,15:00,16:00,17:00,18:00";

    /** Days when bookings are NOT accepted (0=Sun,1=Mon…6=Sat). Comma-separated. */
    @Column(name = "blackout_days", length = 20)
    @Builder.Default
    private String blackoutDays = "";

    // ── Announcements / Banners ──
    @Column(name = "announcement_banner", length = 300)
    private String announcementBanner;

    @Column(name = "announcement_active")
    @Builder.Default
    private Boolean announcementActive = false;
}
