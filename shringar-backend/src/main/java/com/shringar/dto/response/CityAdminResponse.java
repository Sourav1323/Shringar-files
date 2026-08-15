package com.shringar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Safe to serialize directly — unlike the City JPA entity, this has no
 * back-reference from areas to their parent city, so Jackson can never
 * fall into the City → areas → area.city → areas → ... cycle that
 * corrupted the raw-entity response (a single "add city" call was
 * producing a 100KB+ garbled JSON body from that infinite re-serialization).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CityAdminResponse {
    private Long id;
    private String name;
    private String displayName;
    private Boolean isActive;
    private Boolean isComingSoon;
    private Integer artistCount;
    private String launchQuarter;
    private List<AreaAdminResponse> areas;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AreaAdminResponse {
        private String name;
        private Boolean isActive;
    }
}
