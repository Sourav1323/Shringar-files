package com.shringar.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "artists")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Artist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(length = 100)
    private String specialization;

    @Column(length = 50)
    private String city;

    @Column(length = 100)
    private String email;                    // used to send booking-notification emails — not exposed via public ArtistResponse DTO

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "artist_areas", joinColumns = @JoinColumn(name = "artist_id"))
    @Column(name = "area")
    @Builder.Default
    private List<String> serviceAreas = new ArrayList<>();

    @Column
    private Double rating;

    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(name = "avatar_emoji", length = 10)
    private String avatarEmoji;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "instagram_handle", length = 60)
    private String instagramHandle;          // stored WITHOUT the @, e.g. "shringar.bysunita"

    @Column(name = "youtube_channel_url", length = 300)
    private String youtubeChannelUrl;        // full channel or video URL for this artist's work

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "artist_portfolio_images", joinColumns = @JoinColumn(name = "artist_id"))
    @Column(name = "image_url", length = 500)
    @OrderColumn(name = "sort_order")
    @Builder.Default
    private List<String> portfolioImageUrls = new ArrayList<>();   // gallery of past work shown on artist profile

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_top_artist")
    @Builder.Default
    private Boolean isTopArtist = false;

    @Column(name = "badge_label", length = 30)
    private String badgeLabel;

    @Column(name = "is_available")
    @Builder.Default
    private Boolean isAvailable = true;

    @Column(name = "availability_locked_until")
    private LocalDateTime availabilityLockedUntil;

    @Column(name = "availability_last_changed_at")
    private LocalDateTime availabilityLastChangedAt;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
