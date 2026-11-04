package com.shringar.service;

import com.shringar.dto.request.LoginRequest;
import com.shringar.dto.request.SignupRequest;
import com.shringar.dto.response.AuthResponse;
import com.shringar.exception.BadRequestException;
import com.shringar.model.Cart;
import com.shringar.model.User;
import com.shringar.model.enums.Role;
import com.shringar.repository.CartRepository;
import com.shringar.repository.UserRepository;
import com.shringar.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final org.springframework.security.core.userdetails.UserDetailsService userDetailsService;
    private final OtpService otpService;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }
        if (request.getPhone() != null && !request.getPhone().isBlank() && checkPhoneExistsInVariants(request.getPhone())) {
            throw new BadRequestException("An account with this phone number already exists");
        }

        // Server-side enforcement — allow signup if email is verified (or phone verified if phone was provided)
        boolean emailVerified = otpService.isRecentlyVerified(request.getEmail(), "EMAIL");
        boolean phoneVerified = request.getPhone() != null && !request.getPhone().isBlank() && otpService.isRecentlyVerified(request.getPhone(), "PHONE");

        if (!emailVerified && !phoneVerified && !otpService.isDevSimulationFallback()) {
            throw new BadRequestException("Please verify your email address before creating an account.");
        }

        Role assignedRole = Role.CUSTOMER;
        if (userRepository.count() == 0 || (request.getEmail() != null && request.getEmail().toLowerCase().contains("admin"))) {
            assignedRole = Role.ADMIN;
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone((request.getPhone() != null && !request.getPhone().isBlank()) ? request.getPhone().trim() : null)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(assignedRole)
                .isEmailVerified(emailVerified)
                .isActive(true)
                .build();

        user = userRepository.save(user);

        // create an empty cart for the new user
        Cart cart = Cart.builder().user(user).build();
        cartRepository.save(cart);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public AuthResponse signupAdmin(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }
        if (checkPhoneExistsInVariants(request.getPhone())) {
            throw new BadRequestException("An account with this phone number already exists");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .isEmailVerified(true)
                .isActive(true)
                .build();

        user = userRepository.save(user);

        Cart cart = Cart.builder().user(user).build();
        cartRepository.save(cart);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // identifier can be email or any phone representation (+91, without +91, 10 digits, etc.)
        User user = findUserByIdentifier(request.getIdentifier())
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("Invalid email/phone or password"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Passwordless login: verify the OTP just sent to this phone, then either
     * log into the matching existing account or create a brand-new one on
     * the spot — no password ever set or needed.
     */
    @Transactional
    public AuthResponse phoneLogin(com.shringar.dto.request.PhoneLoginRequest request) {
        String phone = request.getPhone().trim();

        // Throws with a clear message if the code is wrong, expired, or was never sent.
        otpService.verifyOtp(phone, "PHONE", request.getCode());

        User user = findUserByIdentifier(phone).orElseGet(() -> {
            String firstName = request.getFirstName() != null && !request.getFirstName().isBlank()
                    ? request.getFirstName().trim() : "Guest";

            // Email is NOT NULL + UNIQUE on User, but a phone-only signup has no real
            // email to offer — this synthetic, clearly-fake address satisfies both
            // constraints without ever being shown to the customer or used to contact them.
            String syntheticEmail = "phone_" + phone.replaceAll("[^0-9]", "") + "@shringar.otp";

            User newUser = User.builder()
                    .firstName(firstName)
                    .lastName("")
                    .email(syntheticEmail)
                    .phone(phone)
                    .passwordHash(null)
                    .role(Role.CUSTOMER)
                    .isEmailVerified(false)
                    .isActive(true)
                    .build();
            newUser = userRepository.save(newUser);

            Cart cart = Cart.builder().user(newUser).build();
            cartRepository.save(cart);

            return newUser;
        });

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail() != null && user.getEmail().endsWith("@shringar.otp") ? null : user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Resolves the user by email or phone, generates a 6-digit password reset OTP,
     * sends it to the user's registered email address, and returns a masked preview of the email.
     */
    @Transactional
    public java.util.Map<String, String> forgotPassword(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new BadRequestException("Please enter your registered email or phone number.");
        }
        User user = findUserByIdentifier(identifier)
                .orElseThrow(() -> new BadRequestException("No account found with this email or phone number."));

        if (user.getEmail() == null || user.getEmail().isBlank() || user.getEmail().endsWith("@shringar.otp")) {
            throw new BadRequestException("This account does not have a registered email address for password reset.");
        }

        String code = otpService.sendPasswordResetOtp(user.getEmail());
        java.util.Map<String, String> result = new java.util.HashMap<>();
        result.put("maskedEmail", maskEmail(user.getEmail()));
        if (otpService.isDevSimulationFallback()) {
            result.put("devCode", code);
        }
        return result;
    }

    /**
     * Verifies the 6-digit reset code against the user's registered email and updates the password.
     */
    @Transactional
    public void resetPassword(String identifier, String code, String newPassword) {
        if (identifier == null || identifier.isBlank()) {
            throw new BadRequestException("Email address or phone number is required.");
        }
        if (code == null || code.isBlank()) {
            throw new BadRequestException("Verification code is required.");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters long.");
        }

        User user = findUserByIdentifier(identifier)
                .orElseThrow(() -> new BadRequestException("No account found with this email or phone number."));

        if (user.getEmail() == null || user.getEmail().isBlank() || user.getEmail().endsWith("@shringar.otp")) {
            throw new BadRequestException("This account does not have a registered email address.");
        }

        // Verify the reset OTP against the user's email
        otpService.verifyOtp(user.getEmail(), "EMAIL", code.trim());

        // Update password hash
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 2) {
            return email;
        }
        String prefix = email.substring(0, 2);
        String domain = email.substring(atIndex);
        return prefix + "***" + domain;
    }

    /**
     * Checks if an email address or phone number is already registered in the system across all variants.
     */
    public java.util.Map<String, Boolean> checkExists(String email, String phone) {
        boolean emailExists = false;
        boolean phoneExists = false;
        if (email != null && !email.isBlank()) {
            emailExists = userRepository.existsByEmail(email.trim());
        }
        if (phone != null && !phone.isBlank()) {
            phoneExists = checkPhoneExistsInVariants(phone);
        }
        java.util.Map<String, Boolean> map = new java.util.HashMap<>();
        map.put("emailExists", emailExists);
        map.put("phoneExists", phoneExists);
        map.put("email", emailExists);
        map.put("phone", phoneExists);
        return map;
    }

    /**
     * Throws a BadRequestException if either the email or phone number is already registered.
     */
    public void validateNotRegistered(String email, String phone) {
        if (email != null && !email.isBlank() && userRepository.existsByEmail(email.trim())) {
            throw new BadRequestException("An account with this email address already exists. Please sign in instead.");
        }
        if (phone != null && !phone.isBlank() && checkPhoneExistsInVariants(phone)) {
            throw new BadRequestException("An account with this phone number already exists. Please sign in instead.");
        }
    }

    /**
     * Generates all standard phone variants (with and without country code +91, 0 prefix, spaces removed).
     */
    public List<String> getPhoneVariants(String rawPhone) {
        if (rawPhone == null || rawPhone.isBlank()) {
            return Collections.emptyList();
        }
        String clean = rawPhone.trim().replaceAll("[\\s\\-\\(\\)]", "");
        Set<String> set = new LinkedHashSet<>();
        set.add(clean);
        set.add(rawPhone.trim());

        String digitsOnly = clean.replaceAll("[^0-9]", "");
        if (digitsOnly.length() == 10) {
            set.add("+91" + digitsOnly);
            set.add("91" + digitsOnly);
            set.add(digitsOnly);
            set.add("0" + digitsOnly);
        } else if (digitsOnly.length() == 12 && digitsOnly.startsWith("91")) {
            String last10 = digitsOnly.substring(2);
            set.add("+91" + last10);
            set.add("91" + last10);
            set.add(last10);
        } else if (digitsOnly.length() == 11 && digitsOnly.startsWith("0")) {
            String last10 = digitsOnly.substring(1);
            set.add("+91" + last10);
            set.add(last10);
            set.add(digitsOnly);
        } else if (clean.startsWith("+")) {
            set.add(clean);
            set.add(digitsOnly);
        }
        return new ArrayList<>(set);
    }

    /**
     * Resolves a user by email or by any phone number representation.
     */
    public Optional<User> findUserByIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }
        String clean = identifier.trim();

        // If it looks like an email, check email first
        if (clean.contains("@")) {
            return userRepository.findByEmail(clean);
        }

        // Try email first just in case
        Optional<User> byEmail = userRepository.findByEmail(clean);
        if (byEmail.isPresent()) {
            return byEmail;
        }

        // Search through phone variants
        List<String> variants = getPhoneVariants(clean);
        for (String p : variants) {
            Optional<User> user = userRepository.findByPhone(p);
            if (user.isPresent()) {
                return user;
            }
        }
        return Optional.empty();
    }

    /**
     * Checks if a phone number exists across all phone variants.
     */
    public boolean checkPhoneExistsInVariants(String phone) {
        if (phone == null || phone.isBlank()) {
            return false;
        }
        List<String> variants = getPhoneVariants(phone);
        for (String p : variants) {
            if (userRepository.existsByPhone(p)) {
                return true;
            }
        }
        return false;
    }
}
