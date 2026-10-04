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

    @PostMapping("/analyze-hand")
    public ApiResponse<HandAnalysisResponse> analyzeHand(@RequestBody HandAnalysisRequest request) {
        return ApiResponse.success("Hand analyzed successfully", aiService.analyzeHand(request));
    }
}
