package com.shringar.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Short-lived verification codes sent to an email or phone number before an
 * account is allowed to be created. A row here does NOT belong to a User —
 * verification happens BEFORE the account exists, which is why this is its
 * own table rather than a column on User.
 *
 * The actual /auth/signup endpoint re-checks server-side that a VERIFIED,
 * unexpired row exists for both the submitted email and phone before it will
 * create the account — the frontend cannot just claim "already verified".
 */
@Entity
@Table(name = "otp_verifications")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The email address or phone number this code was sent to. */
    @Column(nullable = false, length = 100)
    private String identifier;

    @Column(nullable = false, length = 20)
    private String channel;        // "EMAIL" or "PHONE"

    @Column(name = "otp_code", nullable = false, length = 10)
    private String otpCode;

    @Column(nullable = false)
    @Builder.Default
    private Boolean verified = false;

    /** Failed verification attempts against this specific code — capped to stop brute force. */
    @Column(nullable = false)
    @Builder.Default
    private Integer attempts = 0;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
