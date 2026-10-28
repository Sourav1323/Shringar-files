package com.shringar.service;

import com.shringar.dto.response.DesignerOrderResponse;
import com.shringar.dto.response.DesignerPerformanceSummary;
import com.shringar.exception.BadRequestException;
import com.shringar.model.Artist;
import com.shringar.model.Booking;
import com.shringar.model.BookingItem;
import com.shringar.model.DesignerOrder;
import com.shringar.model.enums.BookingStatus;
import com.shringar.model.enums.PreferredTime;
import com.shringar.repository.ArtistRepository;
import com.shringar.repository.DesignerOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class DesignerOrderService {

    private final DesignerOrderRepository designerOrderRepository;
    private final ArtistRepository artistRepository;

    /**
     * Strict Designer Slot Availability Check:
     * Guarantees NO AMBIGUITY: if a designer already has an active or confirmed
     * booking for that exact date and preferred time slot, immediately rejects the slot.
     */
    @Transactional(readOnly = true)
    public void validateDesignerAvailability(Long designerId, LocalDate appointmentDate, PreferredTime preferredTime) {
        if (designerId == null || appointmentDate == null || preferredTime == null) {
            return;
        }

        List<BookingStatus> busyStatuses = List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);
        boolean isOccupied = designerOrderRepository.existsByDesignerIdAndAppointmentDateAndPreferredTimeAndStatusIn(
                designerId, appointmentDate, preferredTime, busyStatuses);

        if (isOccupied) {
            Artist artist = artistRepository.findById(designerId).orElse(null);
            String artistName = artist != null ? artist.getName() : "The selected master designer";
            throw new BadRequestException(String.format(
                    "Designer %s is already booked on %s for the %s slot. Please select another time slot or designer to ensure dedicated royal attention.",
                    artistName, appointmentDate, preferredTime
            ));
        }
    }

    /**
     * Records or synchronizes an order into the dedicated designer_orders table.
     */
    @Transactional
    public DesignerOrder recordBookingOrder(Booking booking) {
        if (booking.getArtist() == null) {
            log.warn("Booking {} has no artist assigned — skipping designer_orders record", booking.getBookingReference());
            return null;
        }

        Artist artist = booking.getArtist();

        // Build designs summary string
        String designsSummary = "Mehendi Art Ceremony";
        int totalDesignsCount = 1;
        if (booking.getItems() != null && !booking.getItems().isEmpty()) {
            designsSummary = booking.getItems().stream()
                    .map(item -> String.format("%s (×%d)", item.getDesign().getName(), item.getQuantity()))
                    .collect(Collectors.joining(", "));
            totalDesignsCount = booking.getItems().stream()
                    .mapToInt(BookingItem::getQuantity)
                    .sum();
        }

        // Calculate Designer Earnings: 80% of designs subtotal + 100% of visit fee
        BigDecimal subtotal = booking.getDesignsSubtotal() != null ? booking.getDesignsSubtotal() : BigDecimal.ZERO;
        BigDecimal visitFee = booking.getArtistVisitFee() != null ? booking.getArtistVisitFee() : new BigDecimal("200.00");
        BigDecimal designerShareOfDesigns = subtotal.multiply(new BigDecimal("0.80")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal designerEarnings = designerShareOfDesigns.add(visitFee);
        BigDecimal platformCommission = booking.getGrandTotal().subtract(designerEarnings).max(BigDecimal.ZERO);

        String slotDescription = booking.getPreferredTime() != null ? booking.getPreferredTime().name() : "SCHEDULED";
        if (booking.getSpecificTime() != null) {
            slotDescription += " (" + booking.getSpecificTime() + ")";
        }

        DesignerOrder order = designerOrderRepository.findByBookingId(booking.getId())
                .orElseGet(() -> DesignerOrder.builder()
                        .booking(booking)
                        .designer(artist)
                        .build());

        order.setDesigner(artist);
        order.setDesignerName(artist.getName());
        order.setBookingReference(booking.getBookingReference());
        order.setCustomerName(booking.getCustomerName());
        order.setCustomerPhone(booking.getCustomerPhone());
        order.setCustomerEmail(booking.getCustomerEmail());
        order.setAppointmentDate(booking.getAppointmentDate());
        order.setPreferredTime(booking.getPreferredTime());
        order.setTimeSlot(slotDescription);
        order.setCity(booking.getCity());
        order.setArea(booking.getArea());
        order.setFullAddress(booking.getFullAddress());
        order.setPincode(booking.getPincode());
        order.setDesignsSummary(designsSummary);
        order.setDesignsCount(totalDesignsCount);
        order.setOrderTotal(booking.getGrandTotal());
        order.setDesignerEarnings(designerEarnings);
        order.setPlatformCommission(platformCommission);
        order.setAdvanceAmount(booking.getAdvanceAmount());
        order.setBalanceAmount(booking.getBalanceAmount());
        order.setStatus(booking.getStatus());

        DesignerOrder saved = designerOrderRepository.save(order);
        log.info("Recorded order in designer_orders table: id={}, designer={}, booking={}, amount=Rs.{}, earnings=Rs.{}",
                saved.getId(), artist.getName(), booking.getBookingReference(), booking.getGrandTotal(), designerEarnings);

        return saved;
    }

    /**
     * Updates order status in designer_orders table (e.g. CONFIRMED, COMPLETED, CANCELLED).
     */
    @Transactional
    public void updateOrderStatus(Long bookingId, BookingStatus newStatus) {
        designerOrderRepository.findByBookingId(bookingId).ifPresent(order -> {
            order.setStatus(newStatus);
            designerOrderRepository.save(order);
            log.info("Updated designer_order status for booking {} to {}", bookingId, newStatus);
        });
    }

    /**
     * Fetch all orders for a specific designer
     */
    @Transactional(readOnly = true)
    public List<DesignerOrderResponse> getOrdersForDesigner(Long designerId) {
        return designerOrderRepository.findByDesignerIdOrderByAppointmentDateDesc(designerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Fetch performance summary and earnings for a specific designer
     */
    @Transactional(readOnly = true)
    public DesignerPerformanceSummary getDesignerSummary(Long designerId) {
        Artist artist = artistRepository.findById(designerId)
                .orElseThrow(() -> new BadRequestException("Designer not found with id: " + designerId));

        long count = designerOrderRepository.countActiveOrdersByDesignerId(designerId);
        BigDecimal earnings = designerOrderRepository.sumEarningsByDesignerId(designerId);
        BigDecimal gross = designerOrderRepository.sumOrderTotalByDesignerId(designerId);
        List<DesignerOrderResponse> recent = designerOrderRepository.findByDesignerIdOrderByAppointmentDateDesc(designerId)
                .stream().limit(10).map(this::toResponse).toList();

        return DesignerPerformanceSummary.builder()
                .designerId(artist.getId())
                .designerName(artist.getName())
                .city(artist.getCity())
                .specialization(artist.getSpecialization())
                .totalOrdersCount(count)
                .totalGrossRevenue(gross)
                .totalDesignerEarnings(earnings)
                .recentOrders(recent)
                .build();
    }

    /**
     * Fetch performance summaries for all active designers
     */
    @Transactional(readOnly = true)
    public List<DesignerPerformanceSummary> getAllDesignersSummary() {
        return artistRepository.findAll().stream()
                .map(a -> {
                    long count = designerOrderRepository.countActiveOrdersByDesignerId(a.getId());
                    BigDecimal earnings = designerOrderRepository.sumEarningsByDesignerId(a.getId());
                    BigDecimal gross = designerOrderRepository.sumOrderTotalByDesignerId(a.getId());
                    return DesignerPerformanceSummary.builder()
                            .designerId(a.getId())
                            .designerName(a.getName())
                            .city(a.getCity())
                            .specialization(a.getSpecialization())
                            .totalOrdersCount(count)
                            .totalGrossRevenue(gross)
                            .totalDesignerEarnings(earnings)
                            .build();
                })
                .toList();
    }

    private DesignerOrderResponse toResponse(DesignerOrder d) {
        return DesignerOrderResponse.builder()
                .id(d.getId())
                .designerId(d.getDesigner() != null ? d.getDesigner().getId() : null)
                .designerName(d.getDesignerName())
                .bookingId(d.getBooking() != null ? d.getBooking().getId() : null)
                .bookingReference(d.getBookingReference())
                .customerName(d.getCustomerName())
                .customerPhone(d.getCustomerPhone())
                .customerEmail(d.getCustomerEmail())
                .appointmentDate(d.getAppointmentDate())
                .preferredTime(d.getPreferredTime())
                .timeSlot(d.getTimeSlot())
                .city(d.getCity())
                .area(d.getArea())
                .fullAddress(d.getFullAddress())
                .pincode(d.getPincode())
                .designsSummary(d.getDesignsSummary())
                .designsCount(d.getDesignsCount())
                .orderTotal(d.getOrderTotal())
                .designerEarnings(d.getDesignerEarnings())
                .platformCommission(d.getPlatformCommission())
                .advanceAmount(d.getAdvanceAmount())
                .balanceAmount(d.getBalanceAmount())
                .status(d.getStatus())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
