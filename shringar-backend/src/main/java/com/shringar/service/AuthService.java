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

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("An account with this phone number already exists");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .isEmailVerified(false)
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

    public AuthResponse login(LoginRequest request) {
        // identifier can be email or phone — resolve to the email used as the security "username"
        User user = userRepository.findByEmail(request.getIdentifier())
                .or(() -> userRepository.findByPhone(request.getIdentifier()))
                .orElseThrow(() -> new BadRequestException("Invalid email/phone or password"));

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
}
