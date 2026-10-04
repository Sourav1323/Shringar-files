package com.shringar.repository;

import com.shringar.model.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    /** Most recent OTP row for this identifier+channel — used both to verify a code and to rate-limit re-sends. */
    Optional<OtpVerification> findFirstByIdentifierAndChannelOrderByCreatedAtDesc(String identifier, String channel);

    /** Used by /auth/signup to confirm this exact identifier was actually verified recently. */
    List<OtpVerification> findByIdentifierAndChannelAndVerifiedTrueAndExpiresAtAfter(
            String identifier, String channel, LocalDateTime now);
}
