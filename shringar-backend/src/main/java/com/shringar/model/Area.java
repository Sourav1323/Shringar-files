package com.shringar.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "areas")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Area {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
