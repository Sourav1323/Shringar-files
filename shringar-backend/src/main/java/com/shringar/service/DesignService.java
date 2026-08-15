package com.shringar.service;

import com.shringar.dto.response.DesignResponse;
import com.shringar.exception.ResourceNotFoundException;
import com.shringar.model.Design;
import com.shringar.repository.DesignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DesignService {

    private final DesignRepository designRepository;

    public List<DesignResponse> getAllDesigns() {
        return designRepository.findByIsActiveTrueOrderBySortOrderAsc()
                .stream().map(this::toResponse).toList();
    }

    /**
     * @param sortBy "popularity" sorts by clickCount descending (most-clicked designs
     *               surface first, exactly what powers the admin-driven "show clicked
     *               designs first" behaviour with zero code changes needed); any other
     *               value (or null) falls back to the manually-curated sortOrder field.
     */
    public List<DesignResponse> getAllDesigns(String sortBy) {
        List<Design> designs = "popularity".equalsIgnoreCase(sortBy)
                ? designRepository.findByIsActiveTrueOrderByClickCountDesc()
                : designRepository.findByIsActiveTrueOrderBySortOrderAsc();
        return designs.stream().map(this::toResponse).toList();
    }

    /** Called by the frontend whenever a design card is clicked/opened — feeds the admin popularity dashboard. */
    @org.springframework.transaction.annotation.Transactional
    public void trackClick(Long designId) {
        int updated = designRepository.incrementClickCount(designId);
        if (updated == 0) {
            throw new ResourceNotFoundException("Design not found with id: " + designId);
        }
    }

    public List<DesignResponse> getFeaturedDesigns() {
        return designRepository.findByIsFeaturedTrueAndIsActiveTrue()
                .stream().map(this::toResponse).toList();
    }

    public List<DesignResponse> getByCategory(String category) {
        return designRepository.findByCategoryAndIsActiveTrue(category)
                .stream().map(this::toResponse).toList();
    }

    public DesignResponse getById(Long id) {
        Design design = designRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Design not found with id: " + id));
        return toResponse(design);
    }

    /**
     * Core of the "AI Try-On" feature: given a detected/selected skin tone,
     * rank all active designs by how well their recommendedSkinTones list matches.
     * The actual photo analysis (skin tone + hand shape detection) happens via
     * an external vision call from PaymentService/Controller layer or a dedicated
     * AiTryOnController that calls the Claude/vision API; this method just does
     * the matching + ranking once the tone string is known.
     */
    public List<DesignResponse> suggestDesignsForSkinTone(String skinTone, int limit) {
        List<Design> all = designRepository.findByIsActiveTrueOrderBySortOrderAsc();

        return all.stream()
                .sorted(Comparator.comparingInt(
                        (Design d) -> d.getRecommendedSkinTones().contains(skinTone) ? 0 : 1
                ).thenComparing(Design::getSortOrder))
                .limit(limit)
                .map(this::toResponse)
                .toList();
    }

    private DesignResponse toResponse(Design d) {
        return DesignResponse.builder()
                .id(d.getId())
                .name(d.getName())
                .description(d.getDescription())
                .category(d.getCategory())
                .coverage(d.getCoverage())
                .durationLabel(d.getDurationLabel())
                .conesNeeded(d.getConesNeeded())
                .price(d.getPrice())
                .imageUrl(d.getImageUrl())
                .galleryImageUrls(d.getGalleryImageUrls())
                .youtubeVideoUrl(d.getYoutubeVideoUrl())
                .emojiIcon(d.getEmojiIcon())
                .badge(d.getBadge())
                .tags(d.getTags())
                .recommendedSkinTones(d.getRecommendedSkinTones())
                .build();
    }
}
