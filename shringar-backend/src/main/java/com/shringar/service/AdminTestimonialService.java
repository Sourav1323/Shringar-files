package com.shringar.service;

import com.shringar.exception.ResourceNotFoundException;
import com.shringar.model.Testimonial;
import com.shringar.repository.TestimonialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminTestimonialService {

    private final TestimonialRepository testimonialRepository;

    public List<Testimonial> getAll() {
        return testimonialRepository.findAllByOrderBySortOrderAsc();
    }

    public List<Testimonial> getPublic() {
        return testimonialRepository.findByIsActiveTrueOrderBySortOrderAsc();
    }

    @Transactional
    public Testimonial create(Map<String, Object> data) {
        return testimonialRepository.save(Testimonial.builder()
                .customerName((String) data.getOrDefault("customerName", "Anonymous"))
                .occasion((String) data.get("occasion"))
                .location((String) data.get("location"))
                .review((String) data.getOrDefault("review", ""))
                .rating(data.containsKey("rating") ? ((Number) data.get("rating")).intValue() : 5)
                .avatarEmoji((String) data.getOrDefault("avatarEmoji", "👩"))
                .avatarImageUrl((String) data.get("avatarImageUrl"))
                .sortOrder(data.containsKey("sortOrder") ? ((Number) data.get("sortOrder")).intValue() : 0)
                .isActive(true)
                .build());
    }

    @Transactional
    public Testimonial update(Long id, Map<String, Object> data) {
        Testimonial t = testimonialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Testimonial not found"));
        if (data.containsKey("customerName")) t.setCustomerName((String) data.get("customerName"));
        if (data.containsKey("occasion"))     t.setOccasion((String) data.get("occasion"));
        if (data.containsKey("location"))     t.setLocation((String) data.get("location"));
        if (data.containsKey("review"))       t.setReview((String) data.get("review"));
        if (data.containsKey("rating"))       t.setRating(((Number) data.get("rating")).intValue());
        if (data.containsKey("avatarEmoji"))  t.setAvatarEmoji((String) data.get("avatarEmoji"));
        if (data.containsKey("avatarImageUrl")) t.setAvatarImageUrl((String) data.get("avatarImageUrl"));
        if (data.containsKey("sortOrder"))    t.setSortOrder(((Number) data.get("sortOrder")).intValue());
        if (data.containsKey("isActive"))     t.setIsActive((Boolean) data.get("isActive"));
        return testimonialRepository.save(t);
    }

    @Transactional
    public void delete(Long id) {
        testimonialRepository.deleteById(id);
    }
}
