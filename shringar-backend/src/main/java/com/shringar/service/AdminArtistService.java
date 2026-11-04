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

import com.shringar.exception.BadRequestException;
import java.time.LocalDateTime;

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
        if (req.getName() != null && artistRepository.existsByNameIgnoreCase(req.getName().trim())) {
            throw new BadRequestException("An artist with this name already exists.");
        }
        if (req.getEmail() != null && !req.getEmail().isBlank() && artistRepository.existsByEmailIgnoreCase(req.getEmail().trim())) {
            throw new BadRequestException("An artist with this email already exists.");
        }

        LocalDateTime now = LocalDateTime.now();
        boolean available = req.getIsAvailable() != null ? req.getIsAvailable() : true;

        Artist artist = Artist.builder()
                .name(req.getName().trim())
                .specialization(req.getSpecialization())
                .city(req.getCity().trim())
                .homePincode(req.getHomePincode() != null ? req.getHomePincode().trim() : null)
                .serviceAreas(req.getServiceAreas() != null ? new ArrayList<>(req.getServiceAreas()) : new ArrayList<>())
                .rating(req.getRating() != null ? req.getRating() : 5.0)
                .reviewCount(req.getReviewCount() != null ? req.getReviewCount() : 0)
                .avatarEmoji(req.getAvatarEmoji())
                .profileImageUrl(req.getProfileImageUrl())
                .portfolioImageUrls(req.getPortfolioImageUrls() != null ? new ArrayList<>(req.getPortfolioImageUrls()) : new ArrayList<>())
                .instagramHandle(req.getInstagramHandle())
                .youtubeChannelUrl(req.getYoutubeChannelUrl())
                .email(req.getEmail() != null ? req.getEmail().trim() : null)
                .experienceYears(req.getExperienceYears())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .isAvailable(available)
                .availabilityLastChangedAt(now)
                .availabilityLockedUntil(available ? now.plusDays(15) : null)
                .isTopArtist(req.getIsTopArtist() != null ? req.getIsTopArtist() : false)
                .badgeLabel(req.getBadgeLabel())
                .build();

        return toAdminResponse(artistRepository.save(artist));
    }

    @Transactional
    public AdminArtistResponse update(Long id, AdminArtistRequest req) {
        Artist artist = findOrThrow(id);

        if (req.getName() != null && !req.getName().trim().equalsIgnoreCase(artist.getName())) {
            if (artistRepository.existsByNameIgnoreCase(req.getName().trim())) {
                throw new BadRequestException("Another artist already uses this name.");
            }
        }
        if (req.getEmail() != null && !req.getEmail().isBlank() && (artist.getEmail() == null || !req.getEmail().trim().equalsIgnoreCase(artist.getEmail()))) {
            if (artistRepository.existsByEmailIgnoreCase(req.getEmail().trim())) {
                throw new BadRequestException("Another artist already uses this email.");
            }
        }

        artist.setName(req.getName().trim());
        artist.setSpecialization(req.getSpecialization());
        artist.setCity(req.getCity().trim());
        if (req.getHomePincode() != null) {
            artist.setHomePincode(req.getHomePincode().trim());
        }
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
        artist.setEmail(req.getEmail() != null ? req.getEmail().trim() : null);
        artist.setExperienceYears(req.getExperienceYears());
        if (req.getIsActive() != null) artist.setIsActive(req.getIsActive());
        if (req.getIsAvailable() != null && !req.getIsAvailable().equals(artist.getIsAvailable())) {
            artist.setIsAvailable(req.getIsAvailable());
            artist.setAvailabilityLastChangedAt(LocalDateTime.now());
            if (req.getIsAvailable()) {
                artist.setAvailabilityLockedUntil(LocalDateTime.now().plusDays(15));
            } else {
                artist.setAvailabilityLockedUntil(null);
            }
        }
        if (req.getIsTopArtist() != null) artist.setIsTopArtist(req.getIsTopArtist());
        artist.setBadgeLabel(req.getBadgeLabel());

        return toAdminResponse(artistRepository.save(artist));
    }

    @Transactional
    public AdminArtistResponse toggleAvailability(Long id, Boolean isAvailable) {
        Artist artist = findOrThrow(id);
        boolean target = isAvailable != null && isAvailable;
        artist.setIsAvailable(target);
        LocalDateTime now = LocalDateTime.now();
        artist.setAvailabilityLastChangedAt(now);
        if (target) {
            artist.setAvailabilityLockedUntil(now.plusDays(15));
        } else {
            artist.setAvailabilityLockedUntil(null);
        }
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
        boolean isLocked = a.getAvailabilityLockedUntil() != null && LocalDateTime.now().isBefore(a.getAvailabilityLockedUntil());
        return AdminArtistResponse.builder()
                .id(a.getId())
                .name(a.getName())
                .specialization(a.getSpecialization())
                .city(a.getCity())
                .homePincode(a.getHomePincode())
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
                .isAvailable(a.getIsAvailable() == null || a.getIsAvailable())
                .availabilityLockedUntil(a.getAvailabilityLockedUntil())
                .availabilityLastChangedAt(a.getAvailabilityLastChangedAt())
                .isAvailabilityLocked(isLocked)
                .isTopArtist(a.getIsTopArtist())
                .badgeLabel(a.getBadgeLabel())
                .build();
    }
}
