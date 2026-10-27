package com.shringar.service;

import com.shringar.dto.response.OtpResponse;
import com.shringar.exception.BadRequestException;
import com.shringar.model.OtpVerification;
import com.shringar.repository.OtpVerificationRepository;
import com.shringar.service.notification.EmailService;
import com.shringar.service.notification.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Generates and verifies 6-digit OTP codes for email and phone, used to
 * confirm a person actually controls the email/phone they're signing up
 * with before an account is created.
 *
 * Both channels degrade gracefully when their underlying provider isn't
 * configured yet: if Gmail SMTP or Twilio credentials are still placeholders,
 * the code is logged to the server console and returned in dev mode instead
 * of failing outright, so the signup flow keeps working end-to-end during
 * local development without getting blocked.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpVerificationRepository otpRepository;
    private final EmailService emailService;
    private final SmsService smsService;

    @org.springframework.beans.factory.annotation.Value("${otp.dev-simulation-fallback:false}")
    private boolean devSimulationFallback;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int OTP_LENGTH = 6;
    private static final int EXPIRY_MINUTES = 10;
    private static final int RESEND_COOLDOWN_SECONDS = 45;
    private static final int MAX_VERIFY_ATTEMPTS = 5;

    /**
     * Generates a new code and sends it, unless one was already sent to this
     * exact identifier within the cooldown window (prevents spamming a
     * mailbox/phone by repeatedly hitting "resend").
     */
    @Transactional
    public OtpResponse sendOtp(String identifier, String channel) {
        final String normalizedChannel = normalizeChannel(channel);
        identifier = identifier.trim();

        otpRepository.findFirstByIdentifierAndChannelOrderByCreatedAtDesc(identifier, normalizedChannel)
                .filter(last -> Duration.between(last.getCreatedAt(), LocalDateTime.now()).getSeconds() < RESEND_COOLDOWN_SECONDS)
                .ifPresent(last -> {
                    long waitSeconds = RESEND_COOLDOWN_SECONDS - Duration.between(last.getCreatedAt(), LocalDateTime.now()).getSeconds();
                    throw new BadRequestException("Please wait " + waitSeconds + "s before requesting another code.");
                });

        String code = generateCode();

        OtpVerification otp = OtpVerification.builder()
                .identifier(identifier)
                .channel(normalizedChannel)
                .otpCode(code)
                .verified(false)
                .attempts(0)
                .expiresAt(LocalDateTime.now().plusMinutes(EXPIRY_MINUTES))
                .build();
        otpRepository.save(otp);

        boolean simulated = false;
        String messageText;

        if ("EMAIL".equals(normalizedChannel)) {
            if (!emailService.isConfigured()) {
                if (devSimulationFallback) {
                    simulated = true;
                    log.info("══════════════════════════════════════════════════════════════");
                    log.info("📧 [OTP EMAIL DEV SIMULATION] To: {} | Code: {}", identifier, code);
                    log.info("══════════════════════════════════════════════════════════════");
                    messageText = "Verification code is " + code;
                } else {
                    throw new BadRequestException(
                        "Real email delivery is enabled, but SMTP is not configured in application.properties. Please configure spring.mail.username and spring.mail.password.");
                }
            } else {
                boolean sent = emailService.sendOtpEmail(identifier, code);
                if (!sent) {
                    if (devSimulationFallback) {
                        simulated = true;
                        log.warn("⚠️ SMTP delivery failed for {}. Falling back to simulation OTP code: {}", identifier, code);
                        messageText = "Verification code is " + code;
                    } else {
                        throw new BadRequestException(
                            "Could not deliver verification email to " + identifier + ". Please verify your email address or SMTP configuration.");
                    }
                } else {
                    messageText = "Verification code sent to " + identifier;
                }
            }
        } else {
            if (!smsService.isConfigured()) {
                if (devSimulationFallback) {
                    simulated = true;
                    log.info("══════════════════════════════════════════════════════════════");
                    log.info("📱 [OTP SMS DEV SIMULATION] To: {} | Code: {}", identifier, code);
                    log.info("══════════════════════════════════════════════════════════════");
                    messageText = "SMS code is " + code;
                } else {
                    throw new BadRequestException(
                        "Real SMS delivery is enabled, but no SMS provider (Twilio or Fast2SMS) is configured in application.properties. Please add your credentials.");
                }
            } else {
                boolean sent = smsService.sendOtpSms(identifier, code);
                if (!sent) {
                    if (devSimulationFallback) {
                        simulated = true;
                        log.warn("⚠️ SMS delivery failed for {}. Falling back to simulation OTP code: {}", identifier, code);
                        messageText = "SMS verification code is " + code;
                    } else {
                        throw new BadRequestException(
                            "Could not send SMS to " + identifier + ". Please check your phone number and SMS provider balance/configuration.");
                    }
                } else {
                    messageText = "Verification code sent via SMS to " + identifier;
                }
            }
        }

        return OtpResponse.builder()
                .simulated(simulated)
                .devCode((simulated && devSimulationFallback) ? code : null)
                .message(messageText)
                .build();
    }

    public boolean isDevSimulationFallback() {
        return devSimulationFallback;
    }

    /** Verifies a submitted code. Throws with a clear message on any failure. */
    @Transactional
    public void verifyOtp(String identifier, String channel, String submittedCode) {
        final String normalizedChannel = normalizeChannel(channel);
        identifier = identifier.trim();

        OtpVerification otp = otpRepository.findFirstByIdentifierAndChannelOrderByCreatedAtDesc(identifier, normalizedChannel)
                .orElseThrow(() -> new BadRequestException("No verification code was sent to this " + normalizedChannel.toLowerCase() + ". Please request one first."));

        if (Boolean.TRUE.equals(otp.getVerified())) {
            return; // already verified — treat as success (e.g. user double-clicked)
        }

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This code has expired. Please request a new one.");
        }

        if (otp.getAttempts() >= MAX_VERIFY_ATTEMPTS) {
            throw new BadRequestException("Too many incorrect attempts. Please request a new code.");
        }

        if (!otp.getOtpCode().equals(submittedCode.trim())) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepository.save(otp);
            int remaining = MAX_VERIFY_ATTEMPTS - otp.getAttempts();
            throw new BadRequestException("Incorrect code." + (remaining > 0 ? " " + remaining + " attempt(s) remaining." : " Please request a new code."));
        }

        otp.setVerified(true);
        otpRepository.save(otp);
    }

    /**
     * Called by AuthService.signup() — confirms a genuinely verified, unexpired
     * OTP row exists for this exact identifier before allowing account creation.
     * This is the server-side check that stops a client from just claiming
     * "already verified" without actually completing the OTP flow.
     */
    /**
     * Called by AuthController.confirmFirebasePhone() — records that Firebase Phone Auth
     * verified this phone number on the client side, allowing signup to complete.
     */
    @Transactional
    public void markPhoneVerified(String phone) {
        if (phone == null || phone.isBlank()) return;
        String normalizedPhone = phone.trim();
        OtpVerification otp = otpRepository.findFirstByIdentifierAndChannelOrderByCreatedAtDesc(normalizedPhone, "PHONE")
                .orElse(null);
        if (otp == null) {
            otp = OtpVerification.builder()
                    .identifier(normalizedPhone)
                    .channel("PHONE")
                    .otpCode("FIREBASE")
                    .verified(true)
                    .attempts(1)
                    .expiresAt(LocalDateTime.now().plusMinutes(20))
                    .build();
        } else {
            otp.setVerified(true);
            otp.setExpiresAt(LocalDateTime.now().plusMinutes(20));
        }
        otpRepository.save(otp);
        log.info("Phone {} marked as verified via Firebase Phone Auth", normalizedPhone);
    }

    public boolean isRecentlyVerified(String identifier, String channel) {
        List<OtpVerification> matches = otpRepository.findByIdentifierAndChannelAndVerifiedTrueAndExpiresAtAfter(
                identifier.trim(), normalizeChannel(channel), LocalDateTime.now());
        return !matches.isEmpty();
    }

    /**
     * Sends phone OTP to the user's provided email address as an instant, 100% free fallback
     * when carrier SMS or Firebase is unavailable.
     */
    @Transactional
    public OtpResponse sendPhoneOtpToEmail(String phone, String email) {
        if (phone == null || phone.isBlank()) throw new BadRequestException("Phone number is required.");
        if (email == null || email.isBlank()) throw new BadRequestException("Email address is required to receive the code.");
        String normalizedPhone = phone.trim();
        String normalizedEmail = email.trim();

        String code = generateCode();
        OtpVerification otp = OtpVerification.builder()
                .identifier(normalizedPhone)
                .channel("PHONE")
                .otpCode(code)
                .verified(false)
                .attempts(0)
                .expiresAt(LocalDateTime.now().plusMinutes(EXPIRY_MINUTES))
                .build();
        otpRepository.save(otp);

        if (!emailService.isConfigured()) {
            if (devSimulationFallback) {
                log.info("══════════════════════════════════════════════════════════════");
                log.info("📱 [PHONE OTP EMAIL DEV SIMULATION] To: {} for phone: {} | Code: {}", normalizedEmail, normalizedPhone, code);
                log.info("══════════════════════════════════════════════════════════════");
                return OtpResponse.builder()
                        .message("Dev Mode: SMTP not configured. Code is " + code)
                        .simulated(true)
                        .devCode(code)
                        .build();
            } else {
                throw new BadRequestException("Real email delivery is enabled, but SMTP is not configured.");
            }
        }

        boolean sent = emailService.sendPhoneOtpToEmail(normalizedEmail, normalizedPhone, code);
        if (!sent) {
            if (devSimulationFallback) {
                log.info("══════════════════════════════════════════════════════════════");
                log.info("📱 [PHONE OTP EMAIL FALLBACK SIMULATION] To: {} for phone: {} | Code: {}", normalizedEmail, normalizedPhone, code);
                log.info("══════════════════════════════════════════════════════════════");
                return OtpResponse.builder()
                        .message("Dev Mode: Code is " + code)
                        .simulated(true)
                        .devCode(code)
                        .build();
            }
            throw new BadRequestException("Could not send verification email to " + normalizedEmail + ". Please check the address.");
        }

        return OtpResponse.builder()
                .message("Verification code sent to " + normalizedEmail)
                .simulated(false)
                .devCode(null)
                .build();
    }

    /**
     * Generates and sends a 6-digit password reset OTP to the user's registered email.
     * Returns the generated code.
     */
    @Transactional
    public String sendPasswordResetOtp(String email) {
        if (email == null || email.isBlank()) throw new BadRequestException("Email address is required.");
        String normalizedEmail = email.trim();

        String code = generateCode();
        OtpVerification otp = OtpVerification.builder()
                .identifier(normalizedEmail)
                .channel("EMAIL")
                .otpCode(code)
                .verified(false)
                .attempts(0)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build();
        otpRepository.save(otp);

        if (!emailService.isConfigured()) {
            if (devSimulationFallback) {
                log.info("══════════════════════════════════════════════════════════════");
                log.info("🔑 [PASSWORD RESET OTP DEV SIMULATION] To: {} | Code: {}", normalizedEmail, code);
                log.info("══════════════════════════════════════════════════════════════");
                return code;
            } else {
                throw new BadRequestException("Real email delivery is enabled, but SMTP is not configured.");
            }
        }

        boolean sent = emailService.sendPasswordResetOtpEmail(normalizedEmail, code);
        if (!sent) {
            if (devSimulationFallback) {
                log.info("══════════════════════════════════════════════════════════════");
                log.info("🔑 [PASSWORD RESET OTP FALLBACK SIMULATION] To: {} | Code: {}", normalizedEmail, code);
                log.info("══════════════════════════════════════════════════════════════");
                return code;
            }
            throw new BadRequestException("Could not send password reset email to " + normalizedEmail + ". Please check the address.");
        }
        return code;
    }

    private String generateCode() {
        int max = (int) Math.pow(10, OTP_LENGTH);
        int code = RANDOM.nextInt(max);
        return String.format("%0" + OTP_LENGTH + "d", code);
    }

    private String normalizeChannel(String channel) {
        if (channel == null) throw new BadRequestException("Channel is required (EMAIL or PHONE).");
        String upper = channel.trim().toUpperCase();
        if (!upper.equals("EMAIL") && !upper.equals("PHONE")) {
            throw new BadRequestException("Channel must be EMAIL or PHONE.");
        }
        return upper;
    }
}
