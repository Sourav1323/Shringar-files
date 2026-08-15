package com.shringar.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cities")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class City {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "display_name", length = 60)
    private String displayName;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_coming_soon")
    @Builder.Default
    private Boolean isComingSoon = false;

    @Column(name = "artist_count")
    @Builder.Default
    private Integer artistCount = 0;

    @Column(name = "launch_quarter", length = 20)
    private String launchQuarter;

    @OneToMany(mappedBy = "city", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private List<Area> areas = new ArrayList<>();
}
