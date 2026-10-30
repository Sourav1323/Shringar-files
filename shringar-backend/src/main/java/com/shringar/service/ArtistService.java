package com.shringar.service;

import com.shringar.dto.response.ArtistResponse;
import com.shringar.exception.ResourceNotFoundException;
import com.shringar.model.Artist;
import com.shringar.repository.ArtistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.shringar.exception.BadRequestException;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ArtistService {

    private final ArtistRepository artistRepository;

    public List<ArtistResponse> getByCity(String city) {
        if (city == null || city.isBlank() || city.equalsIgnoreCase("all")) {
            return artistRepository.findAll().stream()
                    .filter(a -> Boolean.TRUE.equals(a.getIsActive()) && (a.getIsAvailable() == null || Boolean.TRUE.equals(a.getIsAvailable())))
                    .map(this::toResponse).toList();
        }
        return artistRepository.findByCityFlexible(city.trim())
                .stream().map(this::toResponse).toList();
    }

    public List<ArtistResponse> getByCityAndArea(String city, String area) {
        return artistRepository.findByCityAndServiceAreasContainingAndIsActiveTrue(city, area)
                .stream()
                .filter(a -> a.getIsAvailable() == null || Boolean.TRUE.equals(a.getIsAvailable()))
                .map(this::toResponse).toList();
    }

    public ArtistResponse getById(Long id) {
        Artist artist = artistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found"));
        return toResponse(artist);
    }

    @Transactional
    public ArtistResponse toggleAvailability(Long artistId, Boolean isAvailable, boolean isAdminOverride) {
        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found"));

        boolean targetAvailable = isAvailable != null && isAvailable;
        boolean currentlyAvailable = artist.getIsAvailable() == null || Boolean.TRUE.equals(artist.getIsAvailable());

        if (targetAvailable == currentlyAvailable) {
            return toResponse(artist);
        }

        LocalDateTime now = LocalDateTime.now();

        // If artist is currently Available and wants to turn it OFF:
        if (!targetAvailable && currentlyAvailable) {
            if (!isAdminOverride && artist.getAvailabilityLockedUntil() != null && now.isBefore(artist.getAvailabilityLockedUntil())) {
                throw new BadRequestException("Status is locked as Available until " 
                        + artist.getAvailabilityLockedUntil().toLocalDate() 
                        + ". You cannot change your status until the 15-day commitment period expires.");
            }
            artist.setIsAvailable(false);
            artist.setAvailabilityLastChangedAt(now);
            artist.setAvailabilityLockedUntil(null);
        } else if (targetAvailable) {
            // Turning Available ON: locks for 15 days
            artist.setIsAvailable(true);
            artist.setAvailabilityLastChangedAt(now);
            artist.setAvailabilityLockedUntil(now.plusDays(15));
        }

        return toResponse(artistRepository.save(artist));
    }

    public ArtistResponse getByUserId(Long userId) {
        Artist artist = artistRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No artist profile found linked to your account"));
        return toResponse(artist);
    }

    public ArtistResponse toResponse(Artist a) {
        boolean isLocked = a.getAvailabilityLockedUntil() != null && LocalDateTime.now().isBefore(a.getAvailabilityLockedUntil());
        return ArtistResponse.builder()
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
                .instagramUrl(a.getInstagramHandle() != null ? "https://instagram.com/" + a.getInstagramHandle() : null)
                .youtubeChannelUrl(a.getYoutubeChannelUrl())
                .badgeLabel(a.getBadgeLabel())
                .isAvailable(a.getIsAvailable() == null || a.getIsAvailable())
                .availabilityLockedUntil(a.getAvailabilityLockedUntil())
                .availabilityLastChangedAt(a.getAvailabilityLastChangedAt())
                .isAvailabilityLocked(isLocked)
                .build();
    }
}
