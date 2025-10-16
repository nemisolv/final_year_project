package com.nemisolv.starter.payload.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for Text-to-Speech synthesis
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TTSRequest {

    @NotBlank(message = "Text cannot be empty")
    private String text;

    private String voiceId;

    @Builder.Default
    private Double stability = 0.5;

    @Builder.Default
    private Double similarityBoost = 0.75;

    @Builder.Default
    private Double style = 0.0;

    private Integer userId;
}
