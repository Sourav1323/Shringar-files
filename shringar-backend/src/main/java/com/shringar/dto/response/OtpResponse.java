package com.shringar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpResponse {
    /** True if third-party SMS/Email provider is not configured or in dev fallback */
    private boolean simulated;

    /** Only provided when simulated is true, so developers and testers can verify without real SMS/SMTP */
    private String devCode;

    /** Status / explanatory message */
    private String message;
}
