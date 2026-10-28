package com.shringar.service.notification;

import com.shringar.model.ArtistApplication;
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

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${spring.mail.from}")
    private String fromAddress;

    @Value("${admin.notification-emails}")
    private String adminEmailsCsv;

    @Value("${app.frontend-base-url}")
    private String frontendBaseUrl;

    @Override
    public boolean isConfigured() {
        return mailUsername != null
                && !mailUsername.isBlank()
                && !mailUsername.toLowerCase().contains("your_email")
                && mailPassword != null
                && !mailPassword.isBlank()
                && !mailPassword.toLowerCase().contains("your_app_password");
    }

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("EEEE, d MMMM yyyy");

    // ───────────────────────── Customer: booking request received ─────────────────────────

    @Override
    @Async("notificationExecutor")
    public void sendBookingReceivedToCustomer(Booking booking) {
        if (booking.getCustomerEmail() == null || booking.getCustomerEmail().isBlank()) {
            log.info("Booking {} has no customer email on file — skipping customer booking received email.", booking.getBookingReference());
            return;
        }

        String subject = "✦ Booking Request Received — " + booking.getBookingReference() + " (Awaiting Verification)";
        String body = wrapTemplate(
                "Appointment Request Received!",
                "Hi " + firstName(booking.getCustomerName()) + ", thank you for booking your luxury mehendi with Shringar.",
                """
                <p style="font-size:14px;color:#5c3d1e;line-height:1.8;">
                  We have received your appointment details for <strong>%s</strong> (%s).
                  Our royal concierge is verifying your submitted advance payment. Once confirmed, you will receive your official confirmation immediately.
                </p>
                <div style="background:#faf7f2;border:1px solid #e8dec8;border-radius:12px;padding:16px 20px;margin:18px 0;font-size:13px;color:#3d2410;">
                  <div style="font-weight:700;color:#8a6040;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Appointment & Venue Summary</div>
                  <div><strong>Booking Reference:</strong> %s</div>
                  <div style="margin-top:4px;"><strong>Ceremony Date:</strong> %s (%s)</div>
                  <div style="margin-top:4px;"><strong>Venue Address:</strong> %s, %s, %s %s</div>
                  %s
                </div>
                %s
                %s
                <div style="background:#fdf6ec;border:1px solid #f5e8d0;border-radius:10px;padding:16px 20px;margin:20px 0;">
                  <div style="font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#8a6040;margin-bottom:6px;">Advance Payable / Submitted</div>
                  <div style="font-size:22px;font-weight:700;color:#2a1a08;">%s</div>
                  <div style="font-size:12px;color:#8a6040;margin-top:6px;">Remaining balance of %s is payable directly to your artist upon ceremony completion.</div>
                </div>
                %s
                """.formatted(
                        booking.getAppointmentDate().format(DATE_FMT),
                        preferredTimeLabel(booking),
                        booking.getBookingReference(),
                        booking.getAppointmentDate().format(DATE_FMT),
                        preferredTimeLabel(booking),
                        booking.getFullAddress(), booking.getArea(), booking.getCity(),
                        booking.getPincode() != null ? "— PIN: " + booking.getPincode() : "",
                        booking.getUpiTransactionRef() != null && !booking.getUpiTransactionRef().isBlank()
                                ? "<div style=\"margin-top:4px;\"><strong>Submitted UPI UTR:</strong> <span style=\"font-family:monospace;background:#f3efe6;padding:2px 6px;border-radius:4px;\">" + booking.getUpiTransactionRef() + "</span></div>"
                                : "",
                        designsListHtml(booking),
                        paymentSummaryHtml(booking),
                        formatINR(booking.getAdvanceAmount()),
                        formatINR(booking.getBalanceAmount()),
                        ctaButtonHtml("View Booking in Your Profile", orderUrl(booking))
                ),
                "Have questions or need to make adjustments? Reach our royal concierge at shringar.admin@gmail.com or WhatsApp +91 98765 43210."
        );

        send(booking.getCustomerEmail(), subject, body);
    }

    // ───────────────────────── Customer: booking confirmed ─────────────────────────

    @Override
    @Async("notificationExecutor")
    public void sendBookingConfirmationToCustomer(Booking booking) {
        if (booking.getCustomerEmail() == null || booking.getCustomerEmail().isBlank()) {
            log.info("Booking {} has no customer email on file — skipping customer confirmation email.", booking.getBookingReference());
            return;
        }

        String subject = "✨ Booking & Payment Confirmed — " + booking.getBookingReference();
        String body = wrapTemplate(
                "Booking Confirmed & Verified!",
                "Hi " + firstName(booking.getCustomerName()) + ", your advance payment has been verified and your mehendi appointment is officially confirmed.",
                """
                <p style="font-size:14px;color:#5c3d1e;line-height:1.8;">
                  Your master henna artist will arrive on <strong>%s</strong> (%s) at your address in <strong>%s, %s %s</strong>.
                  We can't wait to adorn you with royal henna!
                </p>
                <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:14px 18px;margin:16px 0;color:#065f46;font-size:13px;">
                  <strong>✓ Payment Status: Advance Verified & Locked</strong><br/>
                  <span style="font-size:12px;">Your ceremony slot has been reserved with dedicated designer allocation.</span>
                </div>
                %s
                %s
                <div style="background:#fdf6ec;border:1px solid #f5e8d0;border-radius:10px;padding:16px 20px;margin:20px 0;">
                  <div style="font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#8a6040;margin-bottom:6px;">Advance Paid (Confirmed)</div>
                  <div style="font-size:22px;font-weight:700;color:#2a1a08;">%s</div>
                  <div style="font-size:12px;color:#8a6040;margin-top:6px;">Remaining balance of %s is payable directly to your artist after the design is complete.</div>
                </div>
                %s
                """.formatted(
                        booking.getAppointmentDate().format(DATE_FMT),
                        preferredTimeLabel(booking),
                        booking.getArea(), booking.getCity(),
                        booking.getPincode() != null ? "— PIN: " + booking.getPincode() : "",
                        designsListHtml(booking),
                        paymentSummaryHtml(booking),
                        formatINR(booking.getAdvanceAmount()),
                        formatINR(booking.getBalanceAmount()),
                        ctaButtonHtml("View Booking Details", orderUrl(booking))
                ),
                "Need to make a change? Free cancellation is available up to 48 hours before your appointment from your profile."
        );

        send(booking.getCustomerEmail(), subject, body);
    }

    // ───────────────────────── Admin: new booking order alert (with 1-Click Mail Approval) ─────────────────────────

    @Override
    @Async("notificationExecutor")
    public void sendBookingReceivedToAdmin(Booking booking) {
        List<String> adminEmails = Arrays.stream(adminEmailsCsv.split(","))
                .map(String::trim).filter(s -> !s.isBlank()).toList();

        if (adminEmails.isEmpty()) {
            log.warn("No admin.notification-emails configured — skipping admin notification for booking {}", booking.getBookingReference());
            return;
        }

        String subject = "🔔 New Order Booked #" + booking.getId() + " (" + booking.getBookingReference() + ") — "
                + formatINR(booking.getGrandTotal()) + " [Advance: " + formatINR(booking.getAdvanceAmount()) + "] - " + booking.getCity();

        String approvalButtonHtml = approvalBoxHtml(booking);

        String body = wrapTemplate(
                "New Booking Order Alert",
                "A customer has placed a new booking. Details, amount, location, and 1-click approval below:",
                """
                <div style="background:#faf7f2;border:1px solid #e8dec8;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
                  <table style="width:100%%;font-size:13px;color:#2a1a08;border-collapse:collapse;">
                    <tr><td style="padding:6px 0;color:#8a6040;width:120px;">Booking Ref</td><td style="padding:6px 0;font-weight:700;font-family:monospace;font-size:14px;">#SHR-%s (%s)</td></tr>
                    <tr><td style="padding:6px 0;color:#8a6040;">Customer</td><td style="padding:6px 0;font-weight:600;">%s · <a href="tel:%s" style="color:#7a2c1a;">%s</a></td></tr>
                    <tr><td style="padding:6px 0;color:#8a6040;">Email</td><td style="padding:6px 0;"><a href="mailto:%s" style="color:#7a2c1a;">%s</a></td></tr>
                    <tr><td style="padding:6px 0;color:#8a6040;">Date & Time</td><td style="padding:6px 0;font-weight:600;">%s · %s</td></tr>
                    <tr><td style="padding:6px 0;color:#8a6040;">Full Venue Address</td><td style="padding:6px 0;font-weight:600;">%s, %s, %s %s</td></tr>
                    <tr><td style="padding:6px 0;color:#8a6040;">Assigned Artist</td><td style="padding:6px 0;">%s</td></tr>
                    <tr><td style="padding:6px 0;color:#8a6040;">Grand Total</td><td style="padding:6px 0;font-weight:700;color:#2a1a08;font-size:15px;">%s</td></tr>
                    <tr><td style="padding:6px 0;color:#8a6040;">Advance Amount</td><td style="padding:6px 0;font-weight:700;color:#16a34a;font-size:15px;">%s</td></tr>
                    <tr><td style="padding:6px 0;color:#8a6040;">Balance Due</td><td style="padding:6px 0;font-weight:600;">%s</td></tr>
                    <tr><td style="padding:6px 0;color:#8a6040;">Customer UPI UTR</td><td style="padding:6px 0;font-weight:700;font-family:monospace;background:#fef3c7;padding:4px 8px;border-radius:4px;display:inline-block;">%s</td></tr>
                  </table>
                </div>
                %s
                %s
                %s
                """.formatted(
                        booking.getId(), booking.getBookingReference(),
                        booking.getCustomerName(), booking.getCustomerPhone(), booking.getCustomerPhone(),
                        booking.getCustomerEmail() != null ? booking.getCustomerEmail() : "—",
                        booking.getCustomerEmail() != null ? booking.getCustomerEmail() : "—",
                        booking.getAppointmentDate().format(DATE_FMT), preferredTimeLabel(booking),
                        booking.getFullAddress(), booking.getArea(), booking.getCity(),
                        booking.getPincode() != null ? "— PIN: " + booking.getPincode() : "",
                        booking.getArtist() != null ? booking.getArtist().getName() : "Auto-Assigned",
                        formatINR(booking.getGrandTotal()),
                        formatINR(booking.getAdvanceAmount()),
                        formatINR(booking.getBalanceAmount()),
                        booking.getUpiTransactionRef() != null && !booking.getUpiTransactionRef().isBlank()
                                ? booking.getUpiTransactionRef() : "Awaiting customer UTR entry",
                        designsListHtml(booking),
                        paymentSummaryHtml(booking),
                        approvalButtonHtml
                ),
                "Clicking 'Approve Booking' instantly confirms this order and triggers the confirmation email to the customer."
        );

        for (String adminEmail : adminEmails) {
            send(adminEmail, subject, body);
        }
    }

    @Override
    @Async("notificationExecutor")
    public void sendBookingNotificationToAdmin(Booking booking) {
        // Delegate to sendBookingReceivedToAdmin which includes full details, amounts, and 1-click approve link
        sendBookingReceivedToAdmin(booking);
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

    @Override
    @Async("notificationExecutor")
    public void sendRefundRequestToAdmin(Booking booking) {
        List<String> adminEmails = Arrays.stream(adminEmailsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();

        if (adminEmails.isEmpty()) return;

        String subject = "[Action Required] Refund Request: Booking #" + booking.getBookingReference() + " (" + booking.getCustomerName() + ")";
        String refundStatus = booking.getEffectiveRefundStatus();
        String body = wrapTemplate(
                "Booking Cancellation & Refund Alert",
                "A customer has cancelled booking #" + booking.getBookingReference() + ". Review refund details below:",
                """
                <div style="background:#fcf9f2;border:1px solid #e7d5b8;border-radius:10px;padding:18px;margin-bottom:16px;">
                  <table style="width:100%%;font-size:13px;color:#5c3d1e;border-collapse:collapse;">
                    <tr><td style="padding:5px 0;"><strong>Customer:</strong></td><td>%s (%s)</td></tr>
                    <tr><td style="padding:5px 0;"><strong>Email:</strong></td><td>%s</td></tr>
                    <tr><td style="padding:5px 0;"><strong>Order Reference:</strong></td><td>#%s</td></tr>
                    <tr><td style="padding:5px 0;"><strong>Grand Total:</strong></td><td>%s</td></tr>
                    <tr><td style="padding:5px 0;"><strong>Advance Paid:</strong></td><td><strong>%s</strong></td></tr>
                    <tr><td style="padding:5px 0;"><strong>Customer Refund UPI ID:</strong></td><td><strong style="color:#0f5132;background:#d1e7dd;padding:2px 8px;border-radius:4px;">%s</strong></td></tr>
                    <tr><td style="padding:5px 0;"><strong>Free Window Active?</strong></td><td>%s</td></tr>
                    <tr><td style="padding:5px 0;"><strong>Refund Status:</strong></td><td><span style="color:#b58e34;font-weight:700;">%s</span></td></tr>
                    <tr><td style="padding:5px 0;"><strong>Reason:</strong></td><td><em>%s</em></td></tr>
                  </table>
                </div>
                <div style="text-align:center;margin-top:20px;">
                  <a href="%s/admin-portal/orders.html" style="background:#4a2511;color:#fdfbf7;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:13px;">Manage in Admin Portal →</a>
                </div>
                """.formatted(
                        booking.getCustomerName(),
                        booking.getCustomerPhone(),
                        booking.getCustomerEmail(),
                        booking.getBookingReference(),
                        formatINR(booking.getGrandTotal()),
                        formatINR(booking.getAdvanceAmount()),
                        booking.getCustomerUpiId() != null && !booking.getCustomerUpiId().isBlank() ? booking.getCustomerUpiId() : "Not provided",
                        Boolean.TRUE.equals(booking.getIsRefundEligible()) ? "YES (100% Eligible)" : "NO (Outside Free Window)",
                        refundStatus,
                        booking.getCancellationReason() != null ? booking.getCancellationReason() : "Customer cancelled via portal",
                        frontendBaseUrl
                ),
                "Shringar Luxury Mehendi Management Console"
        );

        for (String adminEmail : adminEmails) {
            send(adminEmail, subject, body);
        }
    }

    @Override
    @Async("notificationExecutor")
    public void sendAdminCancellationWithRefundToCustomer(Booking booking) {
        if (booking.getCustomerEmail() == null || booking.getCustomerEmail().isBlank()) return;

        String subject = "Important: Booking #" + booking.getBookingReference() + " Cancelled by Shringar — Full Refund Initiated";
        String body = wrapTemplate(
                "Booking Update: Full Refund Initiated",
                "Dear " + firstName(booking.getCustomerName()) + ", we regret to inform you that your booking #" + booking.getBookingReference() + " has been cancelled by our administration.",
                """
                <p style="font-size:14px;color:#5c3d1e;line-height:1.8;">
                  <strong>Reason for cancellation:</strong> %s
                </p>
                <div style="background:#eef7ee;border:1px solid #c2e2c2;border-radius:10px;padding:16px;margin:18px 0;">
                  <div style="font-size:14px;font-weight:700;color:#216e28;margin-bottom:6px;">✓ 100%% Full Refund Processed</div>
                  <div style="font-size:13px;color:#2d5032;line-height:1.6;">
                    Because this cancellation was initiated from our end, we have processed a <strong>100%% full refund of %s</strong> to your original payment method.<br>
                    <strong>Estimated credit time:</strong> 3–5 working days.<br>
                    %s
                  </div>
                </div>
                """.formatted(
                        booking.getCancellationReason() != null ? booking.getCancellationReason() : "Administrative schedule conflict",
                        formatINR(booking.getAdvanceAmount()),
                        booking.getRefundId() != null ? "<strong>Refund Reference ID:</strong> " + booking.getRefundId() : ""
                ) + designsListHtml(booking),
                "We sincerely apologize for any inconvenience caused. For immediate assistance, reach our concierge at +91 98765 43210."
        );

        send(booking.getCustomerEmail(), subject, body);
    }

    @Override
    @Async("notificationExecutor")
    public void sendRefundApprovedToCustomer(Booking booking) {
        if (booking.getCustomerEmail() == null || booking.getCustomerEmail().isBlank()) return;

        String subject = "Refund Approved & Processed — Booking #" + booking.getBookingReference();
        String body = wrapTemplate(
                "Refund Approved",
                "Dear " + firstName(booking.getCustomerName()) + ", your refund request has been approved by our team.",
                """
                <div style="background:#eef7ee;border:1px solid #c2e2c2;border-radius:10px;padding:16px;margin:18px 0;">
                  <div style="font-size:14px;font-weight:700;color:#216e28;margin-bottom:6px;">✓ Refund Processed Successfully</div>
                  <div style="font-size:13px;color:#2d5032;line-height:1.6;">
                    <strong>Refund Amount:</strong> %s<br>
                    <strong>Booking Reference:</strong> #%s<br>
                    %s
                    <strong>Credit Timeline:</strong> 3–5 business days to your original payment account.
                  </div>
                </div>
                """.formatted(
                        formatINR(booking.getRefundAmount() != null ? booking.getRefundAmount() : booking.getAdvanceAmount()),
                        booking.getBookingReference(),
                        booking.getRefundId() != null ? "<strong>Refund Transaction ID:</strong> " + booking.getRefundId() + "<br>" : ""
                ),
                "Thank you for choosing Shringar Luxury Mehendi."
        );

        send(booking.getCustomerEmail(), subject, body);
    }

    @Override
    @Async("notificationExecutor")
    public void sendRefundRejectedToCustomer(Booking booking, String reason) {
        if (booking.getCustomerEmail() == null || booking.getCustomerEmail().isBlank()) return;

        String subject = "Refund Request Update — Booking #" + booking.getBookingReference();
        String body = wrapTemplate(
                "Refund Request Review",
                "Dear " + firstName(booking.getCustomerName()) + ", an update regarding your refund request for booking #" + booking.getBookingReference() + ".",
                """
                <div style="background:#fff4f2;border:1px solid #fad2cf;border-radius:10px;padding:16px;margin:18px 0;">
                  <div style="font-size:14px;font-weight:700;color:#8f231b;margin-bottom:6px;">Refund Request Not Approved</div>
                  <div style="font-size:13px;color:#61201b;line-height:1.6;">
                    <strong>Reason:</strong> %s<br><br>
                    As outlined in our booking terms, advance payments for cancellations outside the free cancellation window are committed to the designated artist's reserved schedule.
                  </div>
                </div>
                """.formatted(
                        reason != null && !reason.isBlank() ? reason : "Cancellation occurred after the free-cancellation deadline"
                ),
                "If you believe this is in error, please reply to this email or contact support."
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
                  <p style="font-size:11px;color:#8a6040;margin:8px 0 0;">© 2026 Shringar · <a href="mailto:shringar.admin@gmail.com" style="color:#8a6040;text-decoration:underline;">shringar.admin@gmail.com</a> · <a href="tel:+919876543210" style="color:#8a6040;text-decoration:underline;">+91 98765 43210</a></p>
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

    private String resolveFromAddress() {
        if (fromAddress != null && !fromAddress.isBlank() && !fromAddress.contains("noreply@shringar.in")) {
            return fromAddress;
        }
        if (mailUsername != null && !mailUsername.isBlank() && mailUsername.contains("@")) {
            return mailUsername;
        }
        return (fromAddress != null && !fromAddress.isBlank()) ? fromAddress : "noreply@shringar.in";
    }

    private void send(String to, String subject, String htmlBody) {
        if (!isConfigured()) {
            log.info("[EMAIL SKIPPED — SMTP not configured] To: {} | Subject: {}", to, subject);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            try {
                helper.setFrom(resolveFromAddress(), "Shringar Mehendi");
            } catch (Exception e) {
                helper.setFrom(resolveFromAddress());
            }
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

    private String approvalBoxHtml(Booking booking) {
        String token = booking.getApprovalToken() != null ? booking.getApprovalToken() : "";
        String approveLink = frontendBaseUrl + "/api/public/bookings/" + booking.getBookingReference() + "/approve?token=" + token;
        String adminLink = frontendBaseUrl + "/admin/dashboard";

        return """
            <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:20px;margin:24px 0;text-align:center;">
              <div style="font-size:13px;font-weight:bold;color:#166534;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.06em;">
                ⚡ Royal Executive 1-Click Mail Approval
              </div>
              <p style="font-size:12px;color:#15803d;margin:0 0 16px;line-height:1.6;">
                Verified the payment in your UPI app / bank statement? Click below to instantly approve and confirm this booking without logging into the admin portal.
              </p>
              <div>
                <a href="%s" style="display:inline-block;background:#16a34a;color:#ffffff;padding:13px 30px;border-radius:28px;text-decoration:none;font-weight:700;font-size:14px;box-shadow:0 2px 5px rgba(0,0,0,0.15);">
                  ✓ Approve Booking Now (1-Click)
                </a>
              </div>
              <div style="margin-top:14px;font-size:11px;color:#15803d;">
                Or view in <a href="%s" style="color:#166534;font-weight:600;text-decoration:underline;">Admin Portal Dashboard →</a>
              </div>
            </div>
            """.formatted(approveLink, adminLink);
    }

    private String orderUrl(Booking booking) {
        return frontendBaseUrl + "/profile";
    }

    // ───────────────────────── Artist application notification ─────────────────────────

    @Override
    @Async("notificationExecutor")
    public void sendArtistApplicationNotification(ArtistApplication application) {
        List<String> adminEmails = Arrays.stream(adminEmailsCsv.split(","))
                .map(String::trim).filter(s -> !s.isBlank()).toList();

        if (adminEmails.isEmpty()) {
            log.warn("No admin.notification-emails configured — skipping artist application notification for {}", application.getEmail());
            return;
        }

        String subject = "🎨 New Artist Application — " + application.getFullName();
        String body = wrapTemplate(
                "New Artist Application",
                "Someone wants to join Shringar as a mehendi artist.",
                """
                <table style="width:100%%;font-size:13px;color:#2a1a08;border-collapse:collapse;margin-bottom:16px;">
                  <tr><td style="padding:6px 0;color:#8a6040;">Name</td><td style="padding:6px 0;font-weight:600;">%s</td></tr>
                  <tr><td style="padding:6px 0;color:#8a6040;">Email</td><td style="padding:6px 0;">%s</td></tr>
                  <tr><td style="padding:6px 0;color:#8a6040;">Phone</td><td style="padding:6px 0;">%s</td></tr>
                  <tr><td style="padding:6px 0;color:#8a6040;">City</td><td style="padding:6px 0;">%s</td></tr>
                  <tr><td style="padding:6px 0;color:#8a6040;">Experience</td><td style="padding:6px 0;">%s</td></tr>
                  <tr><td style="padding:6px 0;color:#8a6040;">Specialization</td><td style="padding:6px 0;">%s</td></tr>
                  <tr><td style="padding:6px 0;color:#8a6040;vertical-align:top;">Portfolio</td><td style="padding:6px 0;">%s</td></tr>
                </table>
                <div style="font-size:13px;color:#5c3d1e;line-height:1.7;background:#fdf6ec;border-radius:8px;padding:12px 14px;">%s</div>
                <p style="font-size:12.5px;color:#8a6040;margin-top:16px;">Review and approve this application from the admin portal's Artists → Applications tab, then onboard them as a full artist profile.</p>
                """.formatted(
                        application.getFullName(),
                        application.getEmail(),
                        application.getPhone(),
                        application.getCity(),
                        application.getYearsExperience() != null ? application.getYearsExperience() + " years" : "Not specified",
                        application.getSpecialization() != null && !application.getSpecialization().isBlank() ? application.getSpecialization() : "Not specified",
                        application.getPortfolioLink() != null && !application.getPortfolioLink().isBlank() ? application.getPortfolioLink() : "Not provided",
                        application.getMessage() != null && !application.getMessage().isBlank() ? application.getMessage() : "No additional message provided."
                ),
                null
        );

        for (String adminEmail : adminEmails) {
            send(adminEmail, subject, body);
        }
    }

    // ───────────────────────── OTP email with instant delivery & anti-spam optimization ─────────────────────────

    private boolean sendSecurityEmail(String toEmail, String subject, String plainText, String htmlBody) {
        if (!isConfigured()) {
            log.info("[EMAIL SKIPPED — SMTP not configured] To: {} | Subject: {}", toEmail, subject);
            return false;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();

            // 1. Transactional & high-priority headers to avoid greylisting and delayed queuing
            message.setHeader("X-Priority", "1");
            message.setHeader("Priority", "urgent");
            message.setHeader("Importance", "high");
            message.setHeader("X-MSMail-Priority", "High");
            message.setHeader("Precedence", "urgent");
            message.setHeader("Auto-Submitted", "auto-generated");
            message.setHeader("X-Auto-Response-Suppress", "All");

            // 2. Prevent Gmail thread grouping so each OTP arrives as a brand-new top unread message
            message.setHeader("In-Reply-To", "");
            message.setHeader("References", "");
            String domain = resolveFromAddress().contains("@")
                    ? resolveFromAddress().substring(resolveFromAddress().indexOf("@") + 1)
                    : "gmail.com";
            message.setHeader("Message-ID", "<otp." + System.currentTimeMillis() + "." + java.util.UUID.randomUUID().toString().substring(0, 8) + "@" + domain + ">");
            message.setSentDate(new java.util.Date());

            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            try {
                helper.setFrom(resolveFromAddress(), "Shringar Mehendi");
            } catch (Exception e) {
                helper.setFrom(resolveFromAddress());
            }
            helper.setReplyTo(resolveFromAddress());
            helper.setTo(toEmail);
            helper.setSubject(subject);

            // 3. Set BOTH plain-text and HTML so antispam engines don't flag MIME_HTML_ONLY (prevents 5-minute spam check delay)
            helper.setText(plainText, htmlBody);

            mailSender.send(message);
            log.info("Urgent OTP email sent to {} — Subject: {}", toEmail, subject);
            return true;
        } catch (MessagingException | RuntimeException e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            return false;
        }
    }

    @Override
    public boolean sendOtpEmail(String toEmail, String otpCode) {
        String timeStamp = java.time.LocalTime.now().format(java.time.format.DateTimeFormatter.ofPattern("h:mm a"));
        String subject = "[" + otpCode + "] Shringar Verification Code · " + timeStamp;
        String plainText = """
        Shringar Mehendi Verification

        Your verification code is: %s

        Enter this 6-digit code on the Shringar website to verify your email.
        This code expires in 10 minutes.

        If you did not request this verification, please ignore this email.
        © Shringar Mehendi Art · https://shringar.in
        """.formatted(otpCode);

        String body = wrapTemplate(
                "Verify Your Email",
                "Enter this code to confirm it's really you.",
                """
                <div style="text-align:center;margin:20px 0;">
                  <div style="display:inline-block;background:#fdf6ec;border:2px dashed #c9a227;border-radius:12px;padding:18px 36px;">
                    <div style="font-size:32px;font-weight:700;letter-spacing:0.3em;color:#493313;font-family:monospace;">%s</div>
                  </div>
                </div>
                <p style="font-size:12.5px;color:#8a6040;text-align:center;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
                """.formatted(otpCode),
                null
        );

        return sendSecurityEmail(toEmail, subject, plainText, body);
    }

    @Override
    public boolean sendPasswordResetOtpEmail(String toEmail, String otpCode) {
        String timeStamp = java.time.LocalTime.now().format(java.time.format.DateTimeFormatter.ofPattern("h:mm a"));
        String subject = "[" + otpCode + "] Shringar Password Reset Code · " + timeStamp;
        String plainText = """
        Shringar Mehendi Password Reset

        Your password reset code is: %s

        Enter this 6-digit code on the reset password screen to choose a new password.
        This code expires in 15 minutes.

        If you did not request a password reset, your account is safe and you can safely ignore this email.
        © Shringar Mehendi Art · https://shringar.in
        """.formatted(otpCode);

        String body = wrapTemplate(
                "Reset Your Password",
                "Use this 6-digit code to securely set a new password.",
                """
                <div style="text-align:center;margin:24px 0;">
                  <div style="display:inline-block;background:#fdf6ec;border:2px dashed #7a2c1a;border-radius:12px;padding:18px 36px;">
                    <div style="font-size:32px;font-weight:700;letter-spacing:0.3em;color:#7a2c1a;font-family:monospace;">%s</div>
                  </div>
                </div>
                <p style="font-size:13px;color:#5c3d1e;text-align:center;line-height:1.6;">
                  This code expires in 15 minutes. Enter this code on the password reset screen to choose your new password.
                </p>
                <p style="font-size:12px;color:#8a6040;text-align:center;margin-top:14px;">
                  If you didn't request a password reset, your account is safe and you can safely ignore this email.
                </p>
                """.formatted(otpCode),
                null
        );

        return sendSecurityEmail(toEmail, subject, plainText, body);
    }

    @Override
    public boolean sendPhoneOtpToEmail(String toEmail, String phone, String otpCode) {
        String timeStamp = java.time.LocalTime.now().format(java.time.format.DateTimeFormatter.ofPattern("h:mm a"));
        String subject = "[" + otpCode + "] Shringar Phone Verification Code · " + timeStamp;
        String plainText = """
        Shringar Mehendi Phone Verification

        Verification code for your phone number (%s):
        %s

        Enter this 6-digit code to complete your phone verification.
        This code expires in 10 minutes.

        If you did not request this, please ignore this email.
        © Shringar Mehendi Art · https://shringar.in
        """.formatted(phone, otpCode);

        String body = wrapTemplate(
                "Verify Your Phone Number",
                "Verification code for your phone number (" + phone + ").",
                """
                <div style="text-align:center;margin:24px 0;">
                  <div style="display:inline-block;background:#fdf6ec;border:2px dashed #c9a227;border-radius:12px;padding:18px 36px;">
                    <div style="font-size:32px;font-weight:700;letter-spacing:0.3em;color:#493313;font-family:monospace;">%s</div>
                  </div>
                </div>
                <p style="font-size:13px;color:#5c3d1e;text-align:center;line-height:1.6;">
                  Enter this 6-digit code in the phone verification box to confirm your phone number.
                </p>
                <p style="font-size:12px;color:#8a6040;text-align:center;margin-top:14px;">
                  This code expires in 10 minutes.
                </p>
                """.formatted(otpCode),
                null
        );

        return sendSecurityEmail(toEmail, subject, plainText, body);
    }
}
