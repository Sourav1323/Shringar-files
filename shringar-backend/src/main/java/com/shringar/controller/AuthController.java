package com.shringar.controller;

import com.shringar.dto.request.LoginRequest;
import com.shringar.dto.request.SignupRequest;
import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.AuthResponse;
import com.shringar.dto.response.OtpResponse;
import com.shringar.service.AuthService;
import com.shringar.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    /** POST /api/auth/signup */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", response));
    }

    /** POST /api/auth/signup-admin */
    @PostMapping("/signup-admin")
    public ResponseEntity<ApiResponse<AuthResponse>> signupAdmin(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.signupAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Admin account created successfully", response));
    }

    /** POST /api/auth/login — identifier can be email OR phone */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    /**
     * POST /api/auth/check-exists
     * body: { "email": "someone@email.com", "phone": "+918619377860" }
     * Checks if email or phone is already registered with any account.
     */
    @PostMapping("/check-exists")
    public ApiResponse<Map<String, Boolean>> checkExists(@RequestBody Map<String, String> body) {
        Map<String, Boolean> result = authService.checkExists(body.get("email"), body.get("phone"));
        return ApiResponse.success("Checked", result);
    }

    /**
     * POST /api/auth/send-otp
     * body: { "identifier": "someone@email.com", "channel": "EMAIL", "forSignup": "true" }
     *   or  { "identifier": "9876543210",         "channel": "PHONE", "forSignup": "true" }
     * Called before signup completes, once per field the user has just typed in
     * and wants verified.
     */
    @PostMapping("/send-otp")
    public ApiResponse<OtpResponse> sendOtp(@RequestBody Map<String, String> body) {
        String identifier = body.get("identifier");
        String channel = body.get("channel");
        String forSignup = body.get("forSignup");

        if ("true".equalsIgnoreCase(forSignup)) {
            if ("EMAIL".equalsIgnoreCase(channel)) {
                authService.validateNotRegistered(identifier, null);
            } else if ("PHONE".equalsIgnoreCase(channel)) {
                authService.validateNotRegistered(null, identifier);
            }
        }

        OtpResponse response = otpService.sendOtp(identifier, channel);
        return ApiResponse.success(response.getMessage(), response);
    }

    /**
     * POST /api/auth/verify-otp
     * body: { "identifier": "...", "channel": "EMAIL", "code": "123456" }
     */
    @PostMapping("/verify-otp")
    public ApiResponse<Void> verifyOtp(@RequestBody Map<String, String> body) {
        otpService.verifyOtp(body.get("identifier"), body.get("channel"), body.get("code"));
        return ApiResponse.success("Verified", null);
    }

    /**
     * POST /api/auth/phone-login
     * Passwordless: { "phone": "+919876543210", "code": "123456", "firstName": "Priya" }
     * firstName is only used the first time (creating a brand-new account) —
     * ignored if the phone already matches an existing account.
     */
    @PostMapping("/phone-login")
    public ResponseEntity<ApiResponse<AuthResponse>> phoneLogin(@Valid @RequestBody com.shringar.dto.request.PhoneLoginRequest request) {
        AuthResponse response = authService.phoneLogin(request);
        return ResponseEntity.ok(ApiResponse.success("Signed in successfully", response));
    }

    /**
     * POST /api/auth/confirm-firebase-phone
     * body: { "phone": "+919876543210" }
     * Synchronizes client-side Firebase Phone verification with backend signup check.
     */
    @PostMapping("/confirm-firebase-phone")
    public ApiResponse<Void> confirmFirebasePhone(@RequestBody Map<String, String> body) {
        otpService.markPhoneVerified(body.get("phone"));
        return ApiResponse.success("Phone verified", null);
    }

    /**
     * POST /api/auth/send-phone-otp-to-email
     * body: { "phone": "9876543210", "email": "user@gmail.com", "forSignup": "true" }
     * Instant 100% free fallback when user does not receive SMS on phone.
     */
    @PostMapping("/send-phone-otp-to-email")
    public ApiResponse<OtpResponse> sendPhoneOtpToEmail(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        String email = body.get("email");
        String forSignup = body.get("forSignup");

        if ("true".equalsIgnoreCase(forSignup) || forSignup == null) {
            authService.validateNotRegistered(email, phone);
        }

        OtpResponse response = otpService.sendPhoneOtpToEmail(phone, email);
        return ApiResponse.success(response.getMessage(), response);
    }

    /**
     * POST /api/auth/forgot-password
     * body: { "identifier": "user@gmail.com" } or { "identifier": "9876543210" }
     * Resolves user, generates reset OTP, and delivers it to user's registered email.
     */
    @PostMapping("/forgot-password")
    public ApiResponse<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        Map<String, String> result = authService.forgotPassword(body.get("identifier"));
        return ApiResponse.success("Password reset code sent successfully.", result);
    }

    /**
     * POST /api/auth/reset-password
     * body: { "identifier": "user@gmail.com", "code": "123456", "newPassword": "newpassword123" }
     */
    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@RequestBody Map<String, String> body) {
        authService.resetPassword(body.get("identifier"), body.get("code"), body.get("newPassword"));
        return ApiResponse.success("Password has been reset successfully. You can now sign in with your new password.", null);
    }
}
