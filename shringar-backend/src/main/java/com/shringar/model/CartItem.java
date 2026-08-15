package com.shringar.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart_items")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "design_id", nullable = false)
    private Design design;

    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "coverage_note", length = 100)
    private String coverageNote;       // e.g. "Both Hands (Full)" chosen variant
}
