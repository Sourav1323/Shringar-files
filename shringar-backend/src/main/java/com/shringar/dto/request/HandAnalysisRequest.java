package com.shringar.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HandAnalysisRequest {
    private String image;
    private String manualTone;
    private String apiKey; // Optional client-provided key
}
