package com.nemisolv.starter.payload.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for pronunciation assessment
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PronunciationRequest {

    @NotBlank(message = "Target text cannot be empty")
    private String targetText;

    @NotBlank(message = "Audio path cannot be empty")
    private String audioPath;

    private Integer userId;
}
