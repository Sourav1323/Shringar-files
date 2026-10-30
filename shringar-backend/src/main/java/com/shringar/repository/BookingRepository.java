package com.shringar.repository;

import com.shringar.model.Booking;
import com.shringar.model.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Booking> findByBookingReference(String reference);
    Optional<Booking> findByBookingReferenceAndApprovalToken(String reference, String approvalToken);
    Optional<Booking> findByApprovalToken(String approvalToken);
    List<Booking> findByArtistIdAndAppointmentDateAndStatusIn(
            Long artistId, java.time.LocalDate date, List<BookingStatus> statuses);
    List<Booking> findByAppointmentDateAndStatusIn(
            java.time.LocalDate date, List<BookingStatus> statuses);
    List<Booking> findByAppointmentDateBetweenAndStatusIn(
            java.time.LocalDate startDate, java.time.LocalDate endDate, List<BookingStatus> statuses);
    List<Booking> findByArtistIdAndAppointmentDateBetweenAndStatusIn(
            Long artistId, java.time.LocalDate startDate, java.time.LocalDate endDate, List<BookingStatus> statuses);
    Optional<Booking> findByIdAndUserId(Long id, Long userId);
    boolean existsByUpiTransactionRefAndIdNot(String upiTransactionRef, Long id);

    // ── Admin: paginated order listing, newest first ──
    Page<Booking> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status, Pageable pageable);

    // ── Admin dashboard aggregates ──
    // "Confirmed" here means the advance was actually paid — that's the moment a cart
    // becomes a real order, regardless of its current lifecycle status.
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.isAdvancePaid = true")
    long countConfirmedOrders();

    @Query("SELECT COUNT(b) FROM Booking b")
    long countAllBookingAttempts();

    @Query("SELECT COALESCE(SUM(b.grandTotal), 0) FROM Booking b WHERE b.isAdvancePaid = true")
    BigDecimal sumGrandTotalForConfirmedOrders();

    @Query("SELECT COALESCE(SUM(b.advanceAmount), 0) FROM Booking b WHERE b.isAdvancePaid = true")
    BigDecimal sumAdvanceReceived();

    @Query("SELECT COALESCE(SUM(b.balanceAmount), 0) FROM Booking b WHERE b.isAdvancePaid = true AND b.isBalancePaid = false AND b.status <> 'CANCELLED'")
    BigDecimal sumBalancePending();

    long countByStatus(BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.fulfillmentRating IS NOT NULL OR b.fulfillmentFeedback IS NOT NULL ORDER BY b.customerConfirmedAt DESC, b.createdAt DESC")
    List<Booking> findAllWithFeedback();
}
