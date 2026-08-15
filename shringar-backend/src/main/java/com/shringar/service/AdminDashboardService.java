package com.shringar.service;

import com.shringar.dto.response.AdminBookingResponse;
import com.shringar.dto.response.BookingItemResponse;
import com.shringar.dto.response.DashboardStatsResponse;
import com.shringar.dto.response.PageResponse;
import com.shringar.dto.response.PopularDesignResponse;
import com.shringar.model.Booking;
import com.shringar.model.Design;
import com.shringar.model.enums.BookingStatus;
import com.shringar.model.enums.Role;
import com.shringar.repository.ArtistRepository;
import com.shringar.repository.BookingRepository;
import com.shringar.repository.DesignRepository;
import com.shringar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final BookingRepository bookingRepository;
    private final DesignRepository designRepository;
    private final ArtistRepository artistRepository;
    private final UserRepository userRepository;

    public DashboardStatsResponse getStats() {
        return DashboardStatsResponse.builder()
                .totalOrders(bookingRepository.countConfirmedOrders())
                .totalBookingAttempts(bookingRepository.countAllBookingAttempts())
                .totalOrderValue(bookingRepository.sumGrandTotalForConfirmedOrders())
                .totalAdvanceReceived(bookingRepository.sumAdvanceReceived())
                .totalBalancePending(bookingRepository.sumBalancePending())
                .pendingOrders(bookingRepository.countByStatus(BookingStatus.PENDING))
                .confirmedOrders(bookingRepository.countByStatus(BookingStatus.CONFIRMED))
                .completedOrders(bookingRepository.countByStatus(BookingStatus.COMPLETED))
                .cancelledOrders(bookingRepository.countByStatus(BookingStatus.CANCELLED))
                .totalCustomers(userRepository.countByRole(Role.CUSTOMER))
                .totalDesigns(designRepository.count())
                .totalArtists(artistRepository.count())
                .build();
    }

    /** Powers the "Most Clicked Designs" widget — directly answers "show what's clicked more". */
    public java.util.List<PopularDesignResponse> getMostPopularDesigns() {
        return designRepository.findTop10ByIsActiveTrueOrderByClickCountDesc().stream()
                .map(d -> PopularDesignResponse.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .emojiIcon(d.getEmojiIcon())
                        .clickCount(d.getClickCount())
                        .isFeatured(d.getIsFeatured())
                        .build())
                .toList();
    }

    public PageResponse<AdminBookingResponse> getOrders(int page, int size, BookingStatus statusFilter) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Booking> result = statusFilter != null
                ? bookingRepository.findByStatusOrderByCreatedAtDesc(statusFilter, pageRequest)
                : bookingRepository.findAllByOrderByCreatedAtDesc(pageRequest);

        return PageResponse.<AdminBookingResponse>builder()
                .content(result.getContent().stream().map(this::toAdminBookingResponse).toList())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .hasNext(result.hasNext())
                .build();
    }

    private AdminBookingResponse toAdminBookingResponse(Booking b) {
        var items = b.getItems().stream()
                .map(i -> BookingItemResponse.builder()
                        .designName(i.getDesign().getName())
                        .emojiIcon(i.getDesign().getEmojiIcon())
                        .quantity(i.getQuantity())
                        .price(i.getPriceAtBooking())
                        .build())
                .toList();

        return AdminBookingResponse.builder()
                .id(b.getId())
                .bookingReference(b.getBookingReference())
                .customerName(b.getCustomerName())
                .customerPhone(b.getCustomerPhone())
                .customerEmail(b.getCustomerEmail())
                .appointmentDate(b.getAppointmentDate())
                .preferredTime(b.getPreferredTime())
                .specificTime(b.getSpecificTime())
                .city(b.getCity())
                .area(b.getArea())
                .fullAddress(b.getFullAddress())
                .artistName(b.getArtist() != null ? b.getArtist().getName() : "Unassigned")
                .items(items)
                .designsSubtotal(b.getDesignsSubtotal())
                .artistVisitFee(b.getArtistVisitFee())
                .discountAmount(b.getDiscountAmount())
                .grandTotal(b.getGrandTotal())
                .advanceAmount(b.getAdvanceAmount())
                .balanceAmount(b.getBalanceAmount())
                .status(b.getStatus())
                .isAdvancePaid(b.getIsAdvancePaid())
                .isBalancePaid(b.getIsBalancePaid())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
