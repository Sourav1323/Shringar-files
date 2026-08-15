package com.shringar.controller;

import com.shringar.dto.request.LoginRequest;
import com.shringar.dto.request.SignupRequest;
import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.AuthResponse;
import com.shringar.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** POST /api/auth/signup */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", response));
    }

    /** POST /api/auth/login — identifier can be email OR phone */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}
