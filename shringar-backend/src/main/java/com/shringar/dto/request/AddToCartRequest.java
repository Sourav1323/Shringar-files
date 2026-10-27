package com.shringar.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddToCartRequest {

    @NotNull(message = "Design ID is required")
    private Long designId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity = 1;

    private String coverageNote;
}
