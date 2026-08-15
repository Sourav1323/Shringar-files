package com.shringar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CityResponse {
    private Long id;
    private String name;
    private String displayName;
    private Boolean isActive;
    private Boolean isComingSoon;
    private Integer artistCount;
    private String launchQuarter;
    private List<String> areas;
}
