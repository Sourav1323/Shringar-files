package com.shringar.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "testimonials")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Testimonial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String customerName;

    @Column(length = 80)
    private String occasion;          // e.g. "Bridal Mehendi 2025"

    @Column(length = 80)
    private String location;          // e.g. "Andheri, Mumbai"

    @Column(nullable = false, columnDefinition = "TEXT")
    private String review;

    @Column
    @Builder.Default
    private Integer rating = 5;       // 1–5

    @Column(length = 10)
    @Builder.Default
    private String avatarEmoji = "👩"; // displayed when no photo

    @Column(name = "avatar_image_url", length = 500)
    private String avatarImageUrl;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
