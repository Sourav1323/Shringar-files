package com.shringar.controller;

import com.shringar.dto.request.HandAnalysisRequest;
import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.HandAnalysisResponse;
import com.shringar.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping({"/analyze-hand", "/hand-analysis"})
    public ApiResponse<HandAnalysisResponse> analyzeHand(@RequestBody HandAnalysisRequest request) {
        return ApiResponse.success("Hand analyzed successfully", aiService.analyzeHand(request));
    }

    /**
     * POST /api/ai/tryon or /api/ai/try-on - Emergent Photorealistic Mehndi Try-On
     * Accepts: { "hand_image_b64": "...", "design_id": 1 }
     */
    @PostMapping({"/tryon", "/try-on"})
    public ApiResponse<java.util.Map<String, Object>> generateTryOn(@RequestBody java.util.Map<String, Object> body) {
        return ApiResponse.success("AI Try-On Generated Successfully", aiService.generateTryOn(body));
    }
}
