package com.shringar.service.notification;

import com.shringar.model.ArtistApplication;
import com.shringar.model.Booking;

/**
 * Sends the three booking-confirmation emails: one to the customer, one to
 * the Shringar admin team, and one to the assigned artist. Each is async and
 * independently fault-tolerant — a failure sending to one recipient must not
 * prevent the others from going out.
 */
public interface EmailService {

    void sendBookingReceivedToCustomer(Booking booking);

    void sendBookingConfirmationToCustomer(Booking booking);

    void sendBookingReceivedToAdmin(Booking booking);

    void sendBookingNotificationToAdmin(Booking booking);

    void sendBookingNotificationToArtist(Booking booking);

    void sendBookingCancellationToCustomer(Booking booking);

    void sendRefundRequestToAdmin(Booking booking);

    void sendAdminCancellationWithRefundToCustomer(Booking booking);

    void sendRefundApprovedToCustomer(Booking booking);

    void sendRefundRejectedToCustomer(Booking booking, String reason);

    void sendArtistApplicationNotification(ArtistApplication application);

    void sendCustomRequestToAdmin(com.shringar.model.CustomRequest customRequest);

    void sendCustomRequestConfirmationToCustomer(com.shringar.model.CustomRequest customRequest);

    void sendCustomRequestQuoteToCustomer(com.shringar.model.CustomRequest customRequest);

    /** Synchronous (not @Async like the notifications above) — the caller needs to
     *  know immediately whether the OTP actually went out before telling the user
     *  "check your email". Returns false on any failure rather than throwing, so
     *  OtpService can give a clean "couldn't send, try again" message. */
    boolean sendOtpEmail(String toEmail, String otpCode);

    boolean sendPasswordResetOtpEmail(String toEmail, String otpCode);

    boolean sendPhoneOtpToEmail(String toEmail, String phone, String otpCode);

    /** Returns true if a real SMTP server and credentials are configured (not dummy placeholders). */
    boolean isConfigured();
}
