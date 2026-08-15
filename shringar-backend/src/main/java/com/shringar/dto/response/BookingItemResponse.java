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
public class BookingItemResponse {
    private String designName;
    private String emojiIcon;
    private Integer quantity;
    private BigDecimal price;
}
