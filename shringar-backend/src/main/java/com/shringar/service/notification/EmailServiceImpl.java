package com.shringar.service.notification;

import com.shringar.model.Booking;
import com.shringar.model.BookingItem;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromAddress;

    @Value("${admin.notification-emails}")
    private String adminEmailsCsv;

    @Value("${app.frontend-base-url}")
    private String frontendBaseUrl;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("EEEE, d MMMM yyyy");

    // ───────────────────────── Customer: booking confirmed ─────────────────────────

    @Override
    @Async("notificationExecutor")
    public void sendBookingConfirmationToCustomer(Booking booking) {
        if (booking.getCustomerEmail() == null || booking.getCustomerEmail().isBlank()) {
            log.info("Booking {} has no customer email on file — skipping customer email.", booking.getBookingReference());
            return;
        }

        String subject = "✦ Booking Confirmed — " + booking.getBookingReference();
        String body = wrapTemplate(
                "Booking Confirmed!",
                "Hi " + firstName(booking.getCustomerName()) + ", your mehendi appointment is booked.",
                """
                <p style="font-size:14px;color:#5c3d1e;line-height:1.8;">
                  Your artist will arrive on <strong>%s</strong> (%s) at your address in <strong>%s, %s</strong>.
                  We can't wait for you to be adorned beautifully!
                </p>
                %s
                %s
                <div style="background:#fdf6ec;border:1px solid #f5e8d0;border-radius:10px;padding:16px 20px;margin:20px 0;">
                  <div style="font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#8a6040;margin-bottom:6px;">Advance Paid</div>
                  <div style="font-size:22px;font-weight:700;color:#2a1a08;">%s</div>
                  <div style="font-size:12px;color:#8a6040;margin-top:6px;">Balance of %s is payable directly to your artist after the design is complete.</div>
                </div>
                %s
                """.formatted(
                        booking.getAppointmentDate().format(DATE_FMT),
                        preferredTimeLabel(booking),
                        booking.getArea(), booking.getCity(),
                        designsListHtml(booking),
                        paymentSummaryHtml(booking),
                        formatINR(booking.getAdvanceAmount()),
                        formatINR(booking.getBalanceAmount()),
                        ctaButtonHtml("View Your Booking", orderUrl(booking))
                ),
                "Need to make a change? Free cancellation is available up to 48 hours before your appointment from the booking page above."
        );

        send(booking.getCustomerEmail(), subject, body);
    }

    // ───────────────────────── Admin: new booking notification ─────────────────────────

    @Override
    @Async("notificationExecutor")
    public void sendBookingNotificationToAdmin(Booking booking) {
        List<String> adminEmails = Arrays.stream(adminEmailsCsv.split(","))
                .map(String::trim).filter(s -> !s.isBlank()).toList();

        if (adminEmails.isEmpty()) {
            log.warn("No admin.notification-emails configured — skipping admin notification for booking {}", booking.getBookingReference());
            return;
        }

        String subject = "🔔 New Booking — " + booking.getBookingReference() + " (" + formatINR(booking.getGrandTotal()) + ")";
        String body = wrapTemplate(
                "New Booking Received",
                "A customer has confirmed a booking and paid the advance.",
                """
                <table style="width:100%%;font-size:13px;color:#2a1a08;border-collapse:collapse;margin-bottom:16px;">
                  <tr><td style="padding:6px 0;color:#8a6040;">Customer</td><td style="padding:6px 0;font-weight:600;">%s · %s</td></tr>
                  <tr><td style="padding:6px 0;color:#8a6040;">Email</td><td style="padding:6px 0;">%s</td></tr>
                  <tr><td style="padding:6px 0;color:#8a6040;">Date / Time</td><td style="padding:6px 0;">%s · %s</td></tr>
                  <tr><td style="padding:6px 0;color:#8a6040;">Location</td><td style="padding:6px 0;">%s, %s — %s</td></tr>
                  <tr><td style="padding:6px 0;color:#8a6040;">Assigned Artist</td><td style="padding:6px 0;">%s</td></tr>
                </table>
                %s
                %s
                %s
                """.formatted(
                        booking.getCustomerName(), booking.getCustomerPhone(),
                        booking.getCustomerEmail() != null ? booking.getCustomerEmail() : "—",
                        booking.getAppointmentDate().format(DATE_FMT), preferredTimeLabel(booking),
                        booking.getArea(), booking.getCity(), booking.getFullAddress(),
                        booking.getArtist() != null ? booking.getArtist().getName() : "Unassigned",
                        designsListHtml(booking),
                        paymentSummaryHtml(booking),
                        ctaButtonHtml("View Booking Details", orderUrl(booking))
                ),
                null
        );

        for (String adminEmail : adminEmails) {
            send(adminEmail, subject, body);
        }
    }

    // ───────────────────────── Artist: assigned booking notification ─────────────────────────

    @Override
    @Async("notificationExecutor")
    public void sendBookingNotificationToArtist(Booking booking) {
        if (booking.getArtist() == null || booking.getArtist().getEmail() == null || booking.getArtist().getEmail().isBlank()) {
            log.warn("Booking {} has no artist email on file — skipping artist notification.", booking.getBookingReference());
            return;
        }

        String subject = "🌿 New Appointment Assigned — " + booking.getAppointmentDate().format(DATE_FMT);
        String body = wrapTemplate(
                "You Have a New Booking!",
                "Hi " + firstName(booking.getArtist().getName()) + ", you've been booked for a new appointment.",
                """
                <table style="width:100%%;font-size:13px;color:#2a1a08;border-collapse:collapse;margin-bottom:16px;">
                  <tr><td style="padding:6px 0;color:#8a6040;">Date</td><td style="padding:6px 0;font-weight:600;">%s</td></tr>
                  <tr><td style="padding:6px 0;color:#8a6040;">Preferred Time</td><td style="padding:6px 0;">%s</td></tr>
                  <tr><td style="padding:6px 0;color:#8a6040;">Client</td><td style="padding:6px 0;">%s · %s</td></tr>
                  <tr><td style="padding:6px 0;color:#8a6040;">Address</td><td style="padding:6px 0;">%s, %s, %s</td></tr>
                  %s
                </table>
                %s
                <p style="font-size:13px;color:#5c3d1e;line-height:1.8;">
                  Please confirm your availability and reach out to the client directly if you need to coordinate timing.
                </p>
                """.formatted(
                        booking.getAppointmentDate().format(DATE_FMT),
                        preferredTimeLabel(booking),
                        booking.getCustomerName(), booking.getCustomerPhone(),
                        booking.getFullAddress(), booking.getArea(), booking.getCity(),
                        booking.getSpecialRequests() != null && !booking.getSpecialRequests().isBlank()
                                ? "<tr><td style=\"padding:6px 0;color:#8a6040;vertical-align:top;\">Special Requests</td><td style=\"padding:6px 0;\">" + booking.getSpecialRequests() + "</td></tr>"
                                : "",
                        designsListHtml(booking)
                ),
                null
        );

        send(booking.getArtist().getEmail(), subject, body);
    }

    // ───────────────────────── Customer: booking cancelled ─────────────────────────

    @Override
    @Async("notificationExecutor")
    public void sendBookingCancellationToCustomer(Booking booking) {
        if (booking.getCustomerEmail() == null || booking.getCustomerEmail().isBlank()) return;

        String refundNote = Boolean.TRUE.equals(booking.getIsRefundEligible())
                ? "Your advance of " + formatINR(booking.getAdvanceAmount()) + " is being refunded and should reflect in 5–7 working days."
                : "Since this was within 48 hours of your appointment, the advance of " + formatINR(booking.getAdvanceAmount()) + " is non-refundable as per our cancellation policy.";

        String subject = "Booking Cancelled — " + booking.getBookingReference();
        String body = wrapTemplate(
                "Booking Cancelled",
                "Hi " + firstName(booking.getCustomerName()) + ", your booking has been cancelled as requested.",
                "<p style=\"font-size:14px;color:#5c3d1e;line-height:1.8;\">" + refundNote + "</p>" + designsListHtml(booking),
                "We hope to see you again soon — browse our designs anytime at " + frontendBaseUrl
        );

        send(booking.getCustomerEmail(), subject, body);
    }

    // ───────────────────────── Shared HTML building blocks ─────────────────────────

    private String designsListHtml(Booking booking) {
        if (booking.getItems() == null || booking.getItems().isEmpty()) return "";
        String rows = booking.getItems().stream().map(this::designRowHtml).collect(Collectors.joining());
        return """
            <div style="font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#493313;margin:18px 0 8px;font-weight:600;">Designs Booked</div>
            <table style="width:100%%;border-collapse:collapse;margin-bottom:8px;">%s</table>
            """.formatted(rows);
    }

    private String designRowHtml(BookingItem item) {
        return """
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f5e8d0;font-size:13px;color:#2a1a08;">%s %s</td>
              <td style="padding:8px 0;border-bottom:1px solid #f5e8d0;font-size:13px;color:#7a2c1a;text-align:right;font-weight:600;">%s</td>
            </tr>
            """.formatted(
                item.getDesign().getEmojiIcon() != null ? item.getDesign().getEmojiIcon() : "🤲",
                item.getDesign().getName(),
                formatINR(item.getPriceAtBooking())
        );
    }

    private String paymentSummaryHtml(Booking booking) {
        return """
            <table style="width:100%%;font-size:13px;color:#5c3d1e;border-collapse:collapse;">
              <tr><td style="padding:4px 0;">Designs subtotal</td><td style="padding:4px 0;text-align:right;">%s</td></tr>
              <tr><td style="padding:4px 0;">Artist visit fee</td><td style="padding:4px 0;text-align:right;">%s</td></tr>
              <tr><td style="padding:6px 0;border-top:1px solid #e8d0b0;font-weight:700;color:#2a1a08;">Grand Total</td><td style="padding:6px 0;border-top:1px solid #e8d0b0;text-align:right;font-weight:700;color:#2a1a08;">%s</td></tr>
            </table>
            """.formatted(
                formatINR(booking.getDesignsSubtotal()),
                formatINR(booking.getArtistVisitFee()),
                formatINR(booking.getGrandTotal())
        );
    }

    private String ctaButtonHtml(String label, String url) {
        return """
            <div style="text-align:center;margin:26px 0 10px;">
              <a href="%s" style="display:inline-block;background:#c9a227;color:#2a1a08;padding:13px 32px;border-radius:28px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.03em;">%s</a>
            </div>
            """.formatted(url, label);
    }

    /** Wraps any inner HTML in the shared Shringar-branded email shell (header banner + footer). */
    private String wrapTemplate(String heading, String subheading, String innerHtml, String footerNote) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#fdf6ec;font-family:'Helvetica Neue',Arial,sans-serif;">
              <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
                <div style="background:#493313;border-radius:16px 16px 0 0;padding:32px 28px;text-align:center;">
                  <div style="font-family:Georgia,serif;font-size:22px;letter-spacing:0.08em;color:#fdf6ec;margin-bottom:4px;">✦ Shringar ✦</div>
                  <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(253,246,236,0.5);">मेहंदी कला</div>
                </div>
                <div style="background:#ffffff;padding:32px 28px;border:1px solid #f5e8d0;border-top:none;">
                  <h1 style="font-size:22px;color:#2a1a08;margin:0 0 8px;font-family:Georgia,serif;">%s</h1>
                  <p style="font-size:14px;color:#5c3d1e;margin:0 0 20px;">%s</p>
                  %s
                </div>
                <div style="background:#fdf6ec;border:1px solid #f5e8d0;border-top:none;border-radius:0 0 16px 16px;padding:18px 28px;text-align:center;">
                  %s
                  <p style="font-size:11px;color:#8a6040;margin:8px 0 0;">© 2026 Shringar · hello@shringar.in · +91 98765 43210</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                heading, subheading, innerHtml,
                footerNote != null ? "<p style=\"font-size:12px;color:#5c3d1e;margin:0;\">" + footerNote + "</p>" : ""
        );
    }

    // ───────────────────────── Utilities ─────────────────────────

    private void send(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to {} — subject: {}", to, subject);
        } catch (MessagingException | RuntimeException e) {
            // A failed email must never break the booking/payment flow — log and move on.
            log.error("Failed to send email to {} (subject: {}): {}", to, subject, e.getMessage());
        }
    }

    private String formatINR(BigDecimal amount) {
        if (amount == null) return "₹0";
        return "₹" + amount.setScale(0, java.math.RoundingMode.HALF_UP).toPlainString();
    }

    private String firstName(String fullName) {
        if (fullName == null || fullName.isBlank()) return "there";
        return fullName.trim().split("\\s+")[0];
    }

    private String preferredTimeLabel(Booking booking) {
        String base = switch (booking.getPreferredTime()) {
            case MORNING -> "Morning (9 AM – 12 PM)";
            case AFTERNOON -> "Afternoon (12 PM – 3 PM)";
            case EVENING -> "Evening (3 PM – 6 PM)";
            case FLEXIBLE -> "Flexible — artist's choice";
        };
        return booking.getSpecificTime() != null ? base + " · requested " + booking.getSpecificTime() : base;
    }

    private String orderUrl(Booking booking) {
        return frontendBaseUrl + "/order.html?ref=" + booking.getBookingReference();
    }
}
