package com.shringar.service.notification;

import com.shringar.model.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

/**
 * Single entry point BookingService/PaymentService calls after a booking
 * changes state. Fans out to SMS + the three booking-confirmation emails
 * (customer, admin, artist), or the cancellation email. Every individual
 * send is already @Async and self-contained with its own error handling,
 * so this class just triggers each — it never blocks and a failure in one
 * channel (e.g. SMS) never prevents the others (e.g. emails) from firing.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class BookingNotificationService {

    private final EmailService emailService;
    private final SmsService smsService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("d MMM yyyy");

    /** Call once, right after a booking's advance payment is verified and status becomes CONFIRMED. */
    public void notifyBookingConfirmed(Booking booking) {
        log.info("Firing booking-confirmed notifications for {}", booking.getBookingReference());

        // Customer — SMS
        if (booking.getCustomerPhone() != null && !booking.getCustomerPhone().isBlank()) {
            smsService.sendSms(booking.getCustomerPhone(), buildCustomerSms(booking));
        }

        // Customer — email
        emailService.sendBookingConfirmationToCustomer(booking);

        // Admin team — email
        emailService.sendBookingNotificationToAdmin(booking);

        // Assigned artist — email
        emailService.sendBookingNotificationToArtist(booking);
    }

    /** Call once, right after a booking is cancelled. */
    public void notifyBookingCancelled(Booking booking) {
        log.info("Firing booking-cancelled notification for {}", booking.getBookingReference());
        emailService.sendBookingCancellationToCustomer(booking);
    }

    private String buildCustomerSms(Booking booking) {
        return "Shringar: Your booking %s is confirmed for %s. Artist will arrive at your address in %s. Advance paid: Rs.%s. Reply or call +91 98765 43210 for help."
                .formatted(
                        booking.getBookingReference(),
                        booking.getAppointmentDate().format(DATE_FMT),
                        booking.getArea(),
                        booking.getAdvanceAmount().setScale(0, java.math.RoundingMode.HALF_UP).toPlainString()
                );
    }
}
