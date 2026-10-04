package com.shringar.service.notification;

/**
 * Abstraction over the SMS provider so swapping Twilio for MSG91/AWS SNS/etc.
 * later only means writing a new implementation of this interface — nothing
 * else in the codebase needs to change.
 */
public interface SmsService {

    /**
     * @param toPhoneNumber E.164 format if possible (e.g. "+919876543210").
     *                      Implementations should be defensive about missing "+".
     * @param message       plain-text SMS body, keep under ~300 chars
     */
    void sendSms(String toPhoneNumber, String message);

    /**
     * Sends a 6-digit OTP code synchronously and returns true if accepted by the provider.
     */
    boolean sendOtpSms(String toPhoneNumber, String code);

    /** Returns true if a real SMS provider is enabled and configured. */
    boolean isConfigured();
}
