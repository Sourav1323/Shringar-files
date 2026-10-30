package com.shringar.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuoteCustomRequest {

    @NotNull(message = "Quoted price is required")
    private BigDecimal quotedPrice;

    private BigDecimal advanceRequired;

    private String artistAssigned;

    private String adminNotes;
}
