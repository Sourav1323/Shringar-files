package com.shringar.security;

import com.shringar.exception.UnauthorizedException;
import com.shringar.model.User;
import com.shringar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Controllers receive only an email "username" via the security context
 * (see UserDetailsServiceImpl). This resolves that back to the actual
 * User entity / numeric id so service-layer methods can use it directly.
 */
@Component
@RequiredArgsConstructor
public class CurrentUserResolver {

    private final UserRepository userRepository;

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public Long getCurrentUserIdOptional() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
                return null;
            }
            return userRepository.findByEmail(auth.getName()).map(User::getId).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("You must be logged in to perform this action");
        }
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User session is invalid — please log in again"));
    }
}
