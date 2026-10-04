package com.shringar.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Submitted via the public "Become an Artist" page. Reviewed by admins in
 * the admin portal — approving one does NOT automatically create an Artist
 * record (that still needs real profile details, photos, pricing set up
 * deliberately), it just marks the lead as accepted for the admin to then
 * onboard manually via the existing Artists page.
 */
@Entity
@Table(name = "artist_applications")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ArtistApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, length = 60)
    private String city;

    @Column(name = "years_experience")
    private Integer yearsExperience;

    @Column(length = 200)
    private String specialization;

    @Column(name = "portfolio_link", length = 300)
    private String portfolioLink;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}
