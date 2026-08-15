package com.shringar.service.notification;

import com.shringar.model.Booking;

/**
 * Sends the three booking-confirmation emails: one to the customer, one to
 * the Shringar admin team, and one to the assigned artist. Each is async and
 * independently fault-tolerant — a failure sending to one recipient must not
 * prevent the others from going out.
 */
public interface EmailService {

    void sendBookingConfirmationToCustomer(Booking booking);

    void sendBookingNotificationToAdmin(Booking booking);

    void sendBookingNotificationToArtist(Booking booking);

    void sendBookingCancellationToCustomer(Booking booking);
}
