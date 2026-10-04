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
public class HandAnalysisResponse {
    private String skinTone;
    private String skinHex;
    private String undertone;
    private String handLength;
    private String palmDesc;
    private List<Integer> topDesignIds;
    private List<String> recommendedStyles;
    private String reasonSummary;
    private String engine;
}
