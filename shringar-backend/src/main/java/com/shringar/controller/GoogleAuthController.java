package com.shringar.controller;

import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.AuthResponse;
import com.shringar.exception.BadRequestException;
import com.shringar.model.Cart;
import com.shringar.model.User;
import com.shringar.model.enums.Role;
import com.shringar.repository.CartRepository;
import com.shringar.repository.UserRepository;
import com.shringar.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class GoogleAuthController {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    /**
     * POST /api/auth/google
     * Frontend sends the Google ID token (from Google Identity Services); we verify
     * it against Google's public tokeninfo endpoint (no private key/secret needed
     * on our side), then create or sign in the matching user.
     */
    @PostMapping("/google")
    public ApiResponse<AuthResponse> googleLogin(@RequestBody Map<String, String> body) {
        String idToken = body.get("idToken");
        if (idToken == null || idToken.isBlank()) {
            throw new BadRequestException("Google ID token is required");
        }

        Map<String, String> tokenInfo = verifyGoogleToken(idToken);

        String email    = tokenInfo.get("email");
        String googleId = tokenInfo.get("sub");
        String name     = tokenInfo.get("name");
        String picture  = tokenInfo.get("picture");

        if (email == null || googleId == null) {
            throw new BadRequestException("Invalid Google token — could not retrieve email");
        }

        User user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmail(email))
                .orElseGet(() -> {
                    String firstName = (name != null && name.contains(" "))
                            ? name.substring(0, name.indexOf(" ")) : (name != null ? name : "User");
                    String lastName = (name != null && name.contains(" "))
                            ? name.substring(name.indexOf(" ") + 1) : "";

                    User newUser = User.builder()
                            .firstName(firstName)
                            .lastName(lastName)
                            .email(email)
                            .googleId(googleId)
                            .profilePictureUrl(picture)
                            .role(Role.CUSTOMER)
                            .isEmailVerified(true)
                            .isActive(true)
                            .build();
                    newUser = userRepository.save(newUser);

                    Cart cart = Cart.builder().user(newUser).build();
                    cartRepository.save(cart);
                    return newUser;
                });

        if (user.getGoogleId() == null) {
            user.setGoogleId(googleId);
            if (picture != null) user.setProfilePictureUrl(picture);
            userRepository.save(user);
        }

        var userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return ApiResponse.success("Google sign-in successful", AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .build());
    }

    /** Calls Google's public tokeninfo endpoint — no private credentials needed on our side. */
    private Map<String, String> verifyGoogleToken(String idToken) {
        try {
            URL url = new URL("https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            if (conn.getResponseCode() != 200) {
                throw new BadRequestException("Google token verification failed — invalid or expired token");
            }

            StringBuilder response = new StringBuilder();
            try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
                String line;
                while ((line = br.readLine()) != null) response.append(line);
            }

            Map<String, String> result = new HashMap<>();
            String json = response.toString().replaceAll("[{}\"]", "");
            for (String pair : json.split(",")) {
                String[] kv = pair.split(":", 2);
                if (kv.length == 2) result.put(kv[0].trim(), kv[1].trim());
            }
            return result;

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Could not verify Google token: " + e.getMessage());
        }
    }
}
