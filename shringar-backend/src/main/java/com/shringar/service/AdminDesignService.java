package com.shringar.service;

import com.shringar.dto.request.AdminDesignRequest;
import com.shringar.dto.response.AdminDesignResponse;
import com.shringar.exception.ResourceNotFoundException;
import com.shringar.model.Design;
import com.shringar.repository.DesignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDesignService {

    private final DesignRepository designRepository;

    /** Returns every design, including deactivated ones — the public DesignService only ever returns active ones. */
    public List<AdminDesignResponse> getAllForAdmin() {
        return designRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toAdminResponse).toList();
    }

    public AdminDesignResponse getById(Long id) {
        return toAdminResponse(findOrThrow(id));
    }

    @Transactional
    public AdminDesignResponse create(AdminDesignRequest req) {
        Design design = Design.builder()
                .name(req.getName())
                .description(req.getDescription())
                .category(req.getCategory())
                .coverage(req.getCoverage())
                .durationMinHours(req.getDurationMinHours())
                .durationMaxHours(req.getDurationMaxHours())
                .conesNeeded(req.getConesNeeded())
                .price(req.getPrice())
                .originalPrice(req.getOriginalPrice())
                .palmTierPrice(req.getPalmTierPrice())
                .grandTierPrice(req.getGrandTierPrice())
                .originCity(req.getOriginCity())
                .availableCities(req.getAvailableCities() != null ? new ArrayList<>(req.getAvailableCities()) : new ArrayList<>())
                .assignedArtistIds(req.getAssignedArtistIds() != null ? new ArrayList<>(req.getAssignedArtistIds()) : new ArrayList<>())
                .imageUrl(req.getImageUrl())
                .galleryImageUrls(req.getGalleryImageUrls() != null ? new ArrayList<>(req.getGalleryImageUrls()) : new ArrayList<>())
                .youtubeVideoUrl(req.getYoutubeVideoUrl())
                .emojiIcon(req.getEmojiIcon())
                .badge(req.getBadge())
                .badgeColor(req.getBadgeColor())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .isFeatured(req.getIsFeatured() != null ? req.getIsFeatured() : false)
                .tags(req.getTags() != null ? new ArrayList<>(req.getTags()) : new ArrayList<>())
                .recommendedSkinTones(req.getRecommendedSkinTones() != null ? new ArrayList<>(req.getRecommendedSkinTones()) : new ArrayList<>())
                .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0)
                .clickCount(0L)
                .build();

        return toAdminResponse(designRepository.save(design));
    }

    @Transactional
    public AdminDesignResponse update(Long id, AdminDesignRequest req) {
        Design design = findOrThrow(id);

        design.setName(req.getName());
        design.setDescription(req.getDescription());
        design.setCategory(req.getCategory());
        design.setCoverage(req.getCoverage());
        design.setDurationMinHours(req.getDurationMinHours());
        design.setDurationMaxHours(req.getDurationMaxHours());
        design.setConesNeeded(req.getConesNeeded());
        design.setPrice(req.getPrice());
        design.setOriginalPrice(req.getOriginalPrice());
        design.setPalmTierPrice(req.getPalmTierPrice());
        design.setGrandTierPrice(req.getGrandTierPrice());
        design.setOriginCity(req.getOriginCity());
        if (req.getAvailableCities() != null) {
            design.getAvailableCities().clear();
            design.getAvailableCities().addAll(req.getAvailableCities());
        }
        if (req.getAssignedArtistIds() != null) {
            design.getAssignedArtistIds().clear();
            design.getAssignedArtistIds().addAll(req.getAssignedArtistIds());
        }
        design.setImageUrl(req.getImageUrl());
        if (req.getGalleryImageUrls() != null) {
            design.getGalleryImageUrls().clear();
            design.getGalleryImageUrls().addAll(req.getGalleryImageUrls());
        }
        design.setYoutubeVideoUrl(req.getYoutubeVideoUrl());
        design.setEmojiIcon(req.getEmojiIcon());
        design.setBadge(req.getBadge());
        design.setBadgeColor(req.getBadgeColor());
        if (req.getIsActive() != null) design.setIsActive(req.getIsActive());
        if (req.getIsFeatured() != null) design.setIsFeatured(req.getIsFeatured());
        if (req.getTags() != null) {
            design.getTags().clear();
            design.getTags().addAll(req.getTags());
        }
        if (req.getRecommendedSkinTones() != null) {
            design.getRecommendedSkinTones().clear();
            design.getRecommendedSkinTones().addAll(req.getRecommendedSkinTones());
        }
        if (req.getSortOrder() != null) design.setSortOrder(req.getSortOrder());

        return toAdminResponse(designRepository.save(design));
    }

    /**
     * Soft-delete: flips isActive to false so the design instantly disappears from the
     * public site, without breaking foreign-key references from past order history
     * (CartItem/BookingItem rows that already reference this design id).
     */
    @Transactional
    public void delete(Long id) {
        Design design = findOrThrow(id);
        design.setIsActive(false);
        designRepository.save(design);
    }

    @Transactional
    public AdminDesignResponse restore(Long id) {
        Design design = findOrThrow(id);
        design.setIsActive(true);
        return toAdminResponse(designRepository.save(design));
    }

    private Design findOrThrow(Long id) {
        return designRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Design not found with id: " + id));
    }

    private AdminDesignResponse toAdminResponse(Design d) {
        return AdminDesignResponse.builder()
                .id(d.getId())
                .name(d.getName())
                .description(d.getDescription())
                .category(d.getCategory())
                .coverage(d.getCoverage())
                .durationMinHours(d.getDurationMinHours())
                .durationMaxHours(d.getDurationMaxHours())
                .conesNeeded(d.getConesNeeded())
                .price(d.getPrice())
                .originalPrice(d.getOriginalPrice())
                .palmTierPrice(d.getPalmTierPrice())
                .grandTierPrice(d.getGrandTierPrice())
                .originCity(d.getOriginCity())
                .availableCities(d.getAvailableCities())
                .assignedArtistIds(d.getAssignedArtistIds())
                .imageUrl(d.getImageUrl())
                .galleryImageUrls(d.getGalleryImageUrls())
                .youtubeVideoUrl(d.getYoutubeVideoUrl())
                .emojiIcon(d.getEmojiIcon())
                .badge(d.getBadge())
                .badgeColor(d.getBadgeColor())
                .isActive(d.getIsActive())
                .isFeatured(d.getIsFeatured())
                .tags(d.getTags())
                .recommendedSkinTones(d.getRecommendedSkinTones())
                .sortOrder(d.getSortOrder())
                .clickCount(d.getClickCount())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
