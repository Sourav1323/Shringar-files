package com.shringar.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddToCartRequest {

    @NotNull(message = "Design ID is required")
    private Long designId;

    private Integer quantity = 1;

    private String coverageNote;
}
