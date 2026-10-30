package com.shringar.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "custom_requests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CustomRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_reference", nullable = false, unique = true, length = 30)
    private String requestReference; // e.g. CUST-8021

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Column(name = "customer_email", length = 100)
    private String customerEmail;

    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 60)
    private String category; // Bridal, Arabic, Rajasthani, Minimal, etc.

    @Column(length = 80)
    private String coverage; // Full Hand (Elbow), Both Hands, Palms & Feet, etc.

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "reference_image_url", length = 500)
    private String referenceImageUrl;

    @Column(name = "event_date")
    private LocalDate eventDate;

    @Column(name = "preferred_time", length = 50)
    private String preferredTime;

    @Column(length = 60)
    private String city;

    @Column(length = 10)
    private String pincode;

    @Column(name = "venue_address", columnDefinition = "TEXT")
    private String venueAddress;

    @Column(nullable = false, length = 40)
    @Builder.Default
    private String status = "PENDING_APPROVAL"; // PENDING_APPROVAL, APPROVED_AWAITING_ADVANCE, BOOKED_CONFIRMED, REJECTED

    @Column(name = "quoted_price", precision = 10, scale = 2)
    private BigDecimal quotedPrice;

    @Column(name = "advance_required", precision = 10, scale = 2)
    private BigDecimal advanceRequired;

    @Column(name = "advance_paid")
    @Builder.Default
    private Boolean advancePaid = false;

    @Column(name = "artist_assigned", length = 100)
    private String artistAssigned;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
