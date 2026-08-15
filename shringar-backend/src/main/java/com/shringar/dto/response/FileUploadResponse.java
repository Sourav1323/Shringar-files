package com.shringar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponse {
    private String fileName;
    private String url;          // relative URL, e.g. /api/uploads/abc123.jpg
    private Long sizeBytes;
}
