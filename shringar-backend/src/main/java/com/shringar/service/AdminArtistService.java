package com.shringar.service;

import com.shringar.dto.request.AdminArtistRequest;
import com.shringar.dto.response.AdminArtistResponse;
import com.shringar.exception.ResourceNotFoundException;
import com.shringar.model.Artist;
import com.shringar.repository.ArtistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminArtistService {

    private final ArtistRepository artistRepository;

    /** Returns every artist, including deactivated ones — the public ArtistService only ever returns active ones. */
    public List<AdminArtistResponse> getAllForAdmin() {
        return artistRepository.findAllByOrderByNameAsc()
                .stream().map(this::toAdminResponse).toList();
    }

    public AdminArtistResponse getById(Long id) {
        return toAdminResponse(findOrThrow(id));
    }

    @Transactional
    public AdminArtistResponse create(AdminArtistRequest req) {
        Artist artist = Artist.builder()
                .name(req.getName())
                .specialization(req.getSpecialization())
                .city(req.getCity())
                .serviceAreas(req.getServiceAreas() != null ? new ArrayList<>(req.getServiceAreas()) : new ArrayList<>())
                .rating(req.getRating() != null ? req.getRating() : 5.0)
                .reviewCount(req.getReviewCount() != null ? req.getReviewCount() : 0)
                .avatarEmoji(req.getAvatarEmoji())
                .profileImageUrl(req.getProfileImageUrl())
                .portfolioImageUrls(req.getPortfolioImageUrls() != null ? new ArrayList<>(req.getPortfolioImageUrls()) : new ArrayList<>())
                .instagramHandle(req.getInstagramHandle())
                .youtubeChannelUrl(req.getYoutubeChannelUrl())
                .email(req.getEmail())
                .experienceYears(req.getExperienceYears())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .isTopArtist(req.getIsTopArtist() != null ? req.getIsTopArtist() : false)
                .badgeLabel(req.getBadgeLabel())
                .build();

        return toAdminResponse(artistRepository.save(artist));
    }

    @Transactional
    public AdminArtistResponse update(Long id, AdminArtistRequest req) {
        Artist artist = findOrThrow(id);

        artist.setName(req.getName());
        artist.setSpecialization(req.getSpecialization());
        artist.setCity(req.getCity());
        if (req.getServiceAreas() != null) {
            artist.getServiceAreas().clear();
            artist.getServiceAreas().addAll(req.getServiceAreas());
        }
        if (req.getRating() != null) artist.setRating(req.getRating());
        if (req.getReviewCount() != null) artist.setReviewCount(req.getReviewCount());
        artist.setAvatarEmoji(req.getAvatarEmoji());
        artist.setProfileImageUrl(req.getProfileImageUrl());
        if (req.getPortfolioImageUrls() != null) {
            artist.getPortfolioImageUrls().clear();
            artist.getPortfolioImageUrls().addAll(req.getPortfolioImageUrls());
        }
        artist.setInstagramHandle(req.getInstagramHandle());
        artist.setYoutubeChannelUrl(req.getYoutubeChannelUrl());
        artist.setEmail(req.getEmail());
        artist.setExperienceYears(req.getExperienceYears());
        if (req.getIsActive() != null) artist.setIsActive(req.getIsActive());
        if (req.getIsTopArtist() != null) artist.setIsTopArtist(req.getIsTopArtist());
        artist.setBadgeLabel(req.getBadgeLabel());

        return toAdminResponse(artistRepository.save(artist));
    }

    /**
     * Soft-delete: flips isActive to false so the artist instantly disappears from
     * public booking selection, without breaking the foreign-key reference from
     * past Booking rows that already point at this artist id.
     */
    @Transactional
    public void delete(Long id) {
        Artist artist = findOrThrow(id);
        artist.setIsActive(false);
        artistRepository.save(artist);
    }

    @Transactional
    public AdminArtistResponse restore(Long id) {
        Artist artist = findOrThrow(id);
        artist.setIsActive(true);
        return toAdminResponse(artistRepository.save(artist));
    }

    private Artist findOrThrow(Long id) {
        return artistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found with id: " + id));
    }

    private AdminArtistResponse toAdminResponse(Artist a) {
        return AdminArtistResponse.builder()
                .id(a.getId())
                .name(a.getName())
                .specialization(a.getSpecialization())
                .city(a.getCity())
                .serviceAreas(a.getServiceAreas())
                .rating(a.getRating())
                .reviewCount(a.getReviewCount())
                .avatarEmoji(a.getAvatarEmoji())
                .profileImageUrl(a.getProfileImageUrl())
                .portfolioImageUrls(a.getPortfolioImageUrls())
                .instagramHandle(a.getInstagramHandle())
                .youtubeChannelUrl(a.getYoutubeChannelUrl())
                .email(a.getEmail())
                .experienceYears(a.getExperienceYears())
                .isActive(a.getIsActive())
                .isTopArtist(a.getIsTopArtist())
                .badgeLabel(a.getBadgeLabel())
                .build();
    }
}
