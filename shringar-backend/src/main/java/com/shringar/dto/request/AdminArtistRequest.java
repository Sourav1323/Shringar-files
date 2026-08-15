package com.shringar.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

/** Used for both POST (create) and PUT (update) of an artist from the admin portal. */
@Data
public class AdminArtistRequest {

    @NotBlank(message = "Artist name is required")
    private String name;

    private String specialization;

    @NotBlank(message = "City is required")
    private String city;

    private List<String> serviceAreas;
    private Double rating;
    private Integer reviewCount;
    private String avatarEmoji;
    private String profileImageUrl;
    private List<String> portfolioImageUrls;
    private String instagramHandle;
    private String youtubeChannelUrl;

    @Email(message = "Enter a valid email")
    private String email;

    private Integer experienceYears;
    private Boolean isActive;
    private Boolean isTopArtist;
    private String badgeLabel;
}
