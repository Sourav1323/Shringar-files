package com.shringar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArtistResponse {
    private Long id;
    private String name;
    private String specialization;
    private String city;
    private List<String> serviceAreas;
    private Double rating;
    private Integer reviewCount;
    private String avatarEmoji;
    private String profileImageUrl;
    private List<String> portfolioImageUrls;
    private String instagramHandle;
    private String instagramUrl;
    private String youtubeChannelUrl;
    private String badgeLabel;
}
