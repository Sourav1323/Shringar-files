package com.shringar.controller;

import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.ServiceFeedbackResponse;
import com.shringar.exception.ResourceNotFoundException;
import com.shringar.model.Booking;
import com.shringar.model.Testimonial;
import com.shringar.repository.BookingRepository;
import com.shringar.repository.TestimonialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/feedback")
@RequiredArgsConstructor
public class AdminFeedbackController {

    private final BookingRepository bookingRepository;
    private final TestimonialRepository testimonialRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceFeedbackResponse>>> getFeedbackInbox(
            @RequestParam(required = false) Integer minRating) {
        List<Booking> bookings = bookingRepository.findAllWithFeedback();
        if (minRating != null) {
            bookings = bookings.stream()
                    .filter(b -> b.getFulfillmentRating() != null && b.getFulfillmentRating() >= minRating)
                    .collect(Collectors.toList());
        }

        List<ServiceFeedbackResponse> responses = bookings.stream().map(b ->
                ServiceFeedbackResponse.builder()
                        .bookingId(b.getId())
                        .bookingReference(b.getBookingReference())
                        .customerName(b.getCustomerName())
                        .customerEmail(b.getCustomerEmail())
                        .customerPhone(b.getCustomerPhone())
                        .artistName(b.getArtist() != null ? b.getArtist().getName() : "Assigned Artist")
                        .city(b.getCity())
                        .area(b.getArea())
                        .appointmentDate(b.getAppointmentDate())
                        .rating(b.getFulfillmentRating())
                        .feedback(b.getFulfillmentFeedback())
                        .confirmedAt(b.getCustomerConfirmedAt() != null ? b.getCustomerConfirmedAt() : b.getCreatedAt())
                        .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    /** Feature a customer feedback entry as a live homepage testimonial with 1 click */
    @PostMapping("/{bookingId}/feature-testimonial")
    public ResponseEntity<ApiResponse<Testimonial>> featureAsTestimonial(@PathVariable Long bookingId) {
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        String reviewText = b.getFulfillmentFeedback();
        if (reviewText == null || reviewText.isBlank()) {
            reviewText = "Amazing mehendi service! The artist was punctual, very polite, and the design was stunning.";
        }

        Testimonial t = Testimonial.builder()
                .customerName(b.getCustomerName())
                .occasion("Mehendi Service (" + (b.getCity() != null ? b.getCity() : "Home Service") + ")")
                .location((b.getArea() != null ? b.getArea() + ", " : "") + (b.getCity() != null ? b.getCity() : "India"))
                .review(reviewText)
                .rating(b.getFulfillmentRating() != null ? b.getFulfillmentRating() : 5)
                .avatarEmoji("✨")
                .isActive(true)
                .sortOrder(0)
                .build();

        t = testimonialRepository.save(t);
        return ResponseEntity.ok(ApiResponse.success("Feedback featured as a testimonial on the live site!", t));
    }
}
