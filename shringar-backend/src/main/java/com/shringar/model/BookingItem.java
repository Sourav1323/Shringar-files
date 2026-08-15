package com.shringar.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "booking_items")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BookingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "design_id", nullable = false)
    private Design design;

    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "price_at_booking", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceAtBooking;     // snapshot — price may change later
}
