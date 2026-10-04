package com.shringar.service.notification;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

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

    @Value("${fast2sms.enabled:false}")
    private boolean fast2smsEnabled;

    @Value("${fast2sms.api-key:}")
    private String fast2smsApiKey;

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(6))
            .build();

    @PostConstruct
    public void init() {
        if (enabled) {
            if (accountSid.isBlank() || authToken.isBlank() || fromNumber.isBlank() || accountSid.contains("YOUR_TWILIO")) {
                log.warn("twilio.enabled=true but account-sid/auth-token/from-number are placeholders — " +
                        "SMS sending will fail until real Twilio credentials are provided in application.properties.");
                enabled = false;
            } else {
                try {
                    Twilio.init(accountSid, authToken);
                    log.info("Twilio SMS service initialised (from number: {})", fromNumber);
                } catch (Exception e) {
                    log.error("Failed to initialise Twilio SDK: {}", e.getMessage());
                    enabled = false;
                }
            }
        } else {
            log.info("Twilio SMS sending is disabled (twilio.enabled=false).");
        }

        if (fast2smsEnabled) {
            if (fast2smsApiKey.isBlank() || fast2smsApiKey.contains("YOUR_FAST2SMS")) {
                log.warn("fast2sms.enabled=true but fast2sms.api-key is placeholder.");
                fast2smsEnabled = false;
            } else {
                log.info("Fast2SMS Indian SMS service initialised.");
            }
        }
    }

    @Override
    public boolean isConfigured() {
        boolean twilioConfigured = enabled
                && accountSid != null && !accountSid.isBlank() && !accountSid.contains("YOUR_TWILIO")
                && authToken != null && !authToken.isBlank() && !authToken.contains("YOUR_TWILIO")
                && fromNumber != null && !fromNumber.isBlank();

        boolean fast2smsConfigured = fast2smsEnabled
                && fast2smsApiKey != null && !fast2smsApiKey.isBlank() && !fast2smsApiKey.contains("YOUR_FAST2SMS");

        return twilioConfigured || fast2smsConfigured;
    }

    @Override
    public boolean sendOtpSms(String toPhoneNumber, String code) {
        String digitsOnly = toPhoneNumber != null ? toPhoneNumber.replaceAll("[^0-9]", "") : "";
        String tenDigits = digitsOnly.length() >= 10 ? digitsOnly.substring(digitsOnly.length() - 10) : digitsOnly;
        String normalized = normalizeIndianNumber(toPhoneNumber);

        // 1. Try Fast2SMS if enabled (optimized for India numbers)
        if (fast2smsEnabled && fast2smsApiKey != null && !fast2smsApiKey.isBlank() && !fast2smsApiKey.contains("YOUR_FAST2SMS")) {
            try {
                String url = "https://www.fast2sms.com/dev/bulkV2?authorization=" + fast2smsApiKey.trim() +
                        "&route=otp&variables_values=" + code + "&numbers=" + tenDigits;
                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .timeout(Duration.ofSeconds(8))
                        .GET()
                        .build();
                HttpResponse<String> resp = HTTP_CLIENT.send(req, HttpResponse.BodyHandlers.ofString());
                if (resp.statusCode() == 200 && resp.body() != null && resp.body().contains("\"return\":true")) {
                    log.info("Fast2SMS OTP sent successfully to Indian number {}", tenDigits);
                    return true;
                } else {
                    log.error("Fast2SMS OTP failed for {}: HTTP {} -> {}", tenDigits, resp.statusCode(), resp.body());
                }
            } catch (Exception e) {
                log.error("Fast2SMS call exception for {}: {}", tenDigits, e.getMessage());
            }
        }

        // 2. Try Twilio if enabled
        if (enabled && accountSid != null && !accountSid.isBlank() && !accountSid.contains("YOUR_TWILIO")) {
            try {
                Message message = Message.creator(
                        new PhoneNumber(normalized),
                        new PhoneNumber(fromNumber),
                        "Your Shringar verification code is " + code + ". It expires in 10 minutes."
                ).create();
                log.info("Twilio OTP SMS sent successfully to {} (SID: {})", normalized, message.getSid());
                return true;
            } catch (Exception e) {
                log.error("Twilio OTP SMS failed to {}: {}", normalized, e.getMessage());
                return false;
            }
        }

        log.warn("No active SMS provider configured to send OTP to {}", normalized);
        return false;
    }

    @Override
    @Async("notificationExecutor")
    public void sendSms(String toPhoneNumber, String message) {
        String normalized = normalizeIndianNumber(toPhoneNumber);
        String digitsOnly = toPhoneNumber != null ? toPhoneNumber.replaceAll("[^0-9]", "") : "";
        String tenDigits = digitsOnly.length() >= 10 ? digitsOnly.substring(digitsOnly.length() - 10) : digitsOnly;

        if (fast2smsEnabled && fast2smsApiKey != null && !fast2smsApiKey.isBlank() && !fast2smsApiKey.contains("YOUR_FAST2SMS")) {
            try {
                String encodedMsg = java.net.URLEncoder.encode(message, java.nio.charset.StandardCharsets.UTF_8);
                String url = "https://www.fast2sms.com/dev/bulkV2?authorization=" + fast2smsApiKey.trim() +
                        "&route=q&message=" + encodedMsg + "&language=english&flash=0&numbers=" + tenDigits;
                HttpRequest req = HttpRequest.newBuilder().uri(URI.create(url)).timeout(Duration.ofSeconds(8)).GET().build();
                HTTP_CLIENT.send(req, HttpResponse.BodyHandlers.ofString());
                log.info("Fast2SMS sent notification to {}", tenDigits);
                return;
            } catch (Exception e) {
                log.error("Fast2SMS notification error for {}: {}", tenDigits, e.getMessage());
            }
        }

        if (!enabled) {
            log.info("[SMS SKIPPED — No SMS provider active] To: {} | Message: {}", normalized, message);
            return;
        }

        try {
            Message.creator(
                    new PhoneNumber(normalized),
                    new PhoneNumber(fromNumber),
                    message
            ).create();
            log.info("Twilio notification SMS sent to {}", normalized);
        } catch (Exception e) {
            log.error("Failed to send Twilio notification SMS to {}: {}", normalized, e.getMessage());
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
