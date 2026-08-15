package com.shringar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long cartItemId;
    private Long designId;
    private String designName;
    private String emojiIcon;
    private String coverage;
    private String durationLabel;
    private Double conesNeeded;
    private BigDecimal price;
    private Integer quantity;
    private String coverageNote;
}
