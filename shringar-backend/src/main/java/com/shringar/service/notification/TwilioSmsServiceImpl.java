package com.shringar.service.notification;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class TwilioSmsServiceImpl implements SmsService {

    @Value("${twilio.enabled:false}")
    private boolean enabled;

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.from-number:}")
    private String fromNumber;

    @PostConstruct
    public void init() {
        if (enabled) {
            if (accountSid.isBlank() || authToken.isBlank() || fromNumber.isBlank()) {
                log.warn("twilio.enabled=true but account-sid/auth-token/from-number are not fully configured — " +
                        "SMS sending will fail until application.properties is updated with real Twilio credentials.");
                enabled = false;
                return;
            }
            Twilio.init(accountSid, authToken);
            log.info("Twilio SMS service initialised (from number: {})", fromNumber);
        } else {
            log.info("Twilio SMS sending is disabled (twilio.enabled=false) — booking SMS will be logged, not sent.");
        }
    }

    @Override
    @Async("notificationExecutor")
    public void sendSms(String toPhoneNumber, String message) {
        String normalized = normalizeIndianNumber(toPhoneNumber);

        if (!enabled) {
            log.info("[SMS SKIPPED — Twilio disabled] To: {} | Message: {}", normalized, message);
            return;
        }

        try {
            Message.creator(
                    new PhoneNumber(normalized),
                    new PhoneNumber(fromNumber),
                    message
            ).create();
            log.info("SMS sent successfully to {}", normalized);
        } catch (Exception e) {
            // Never let a failed SMS break the booking flow — just log it loudly.
            log.error("Failed to send SMS to {}: {}", normalized, e.getMessage());
        }
    }

    /** Best-effort: assumes a 10-digit Indian mobile number if no country code is present. */
    private String normalizeIndianNumber(String phone) {
        if (phone == null) return null;
        String digitsOnly = phone.replaceAll("[^0-9+]", "");
        if (digitsOnly.startsWith("+")) return digitsOnly;
        if (digitsOnly.length() == 10) return "+91" + digitsOnly;
        if (digitsOnly.startsWith("91") && digitsOnly.length() == 12) return "+" + digitsOnly;
        return "+" + digitsOnly;
    }
}
