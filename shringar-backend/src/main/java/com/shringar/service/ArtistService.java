package com.shringar.service;

import com.shringar.dto.response.ArtistResponse;
import com.shringar.exception.ResourceNotFoundException;
import com.shringar.model.Artist;
import com.shringar.repository.ArtistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArtistService {

    private final ArtistRepository artistRepository;

    public List<ArtistResponse> getByCity(String city) {
        if (city == null || city.isBlank() || city.equalsIgnoreCase("all")) {
            return artistRepository.findAll().stream()
                    .filter(a -> Boolean.TRUE.equals(a.getIsActive()))
                    .map(this::toResponse).toList();
        }
        return artistRepository.findByCityFlexible(city.trim())
                .stream().map(this::toResponse).toList();
    }

    public List<ArtistResponse> getByCityAndArea(String city, String area) {
        return artistRepository.findByCityAndServiceAreasContainingAndIsActiveTrue(city, area)
                .stream().map(this::toResponse).toList();
    }

    public ArtistResponse getById(Long id) {
        Artist artist = artistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found"));
        return toResponse(artist);
    }

    private ArtistResponse toResponse(Artist a) {
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
                .build();
    }
}
