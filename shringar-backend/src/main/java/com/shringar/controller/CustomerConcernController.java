package com.shringar.controller;

import com.shringar.dto.request.CreateConcernRequest;
import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.ConcernResponse;
import com.shringar.security.CurrentUserResolver;
import com.shringar.service.CustomerConcernService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/support/concerns")
@RequiredArgsConstructor
public class CustomerConcernController {

    private final CustomerConcernService concernService;
    private final CurrentUserResolver currentUser;

    @PostMapping
    public ResponseEntity<ApiResponse<ConcernResponse>> createConcern(
            @Valid @RequestBody CreateConcernRequest request) {
        Long userId = currentUser.getCurrentUserIdOptional();
        ConcernResponse response = concernService.createConcern(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Your concern has been submitted. Our team will review and respond shortly.", response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ConcernResponse>>> getMyConcerns(
            @RequestParam(required = false) String email) {
        Long userId = currentUser.getCurrentUserIdOptional();
        List<ConcernResponse> list = concernService.getUserConcerns(userId, email);
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
