package com.shringar.controller;

import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.UserResponse;
import com.shringar.model.User;
import com.shringar.security.CurrentUserResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final CurrentUserResolver currentUser;

    /** GET /api/users/me — used by the profile icon / header after login */
    @GetMapping("/me")
    public ApiResponse<UserResponse> getProfile() {
        User user = currentUser.getCurrentUser();
        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .city(user.getCity())
                .profilePictureUrl(user.getProfilePictureUrl())
                .build();
        return ApiResponse.success(response);
    }
}
