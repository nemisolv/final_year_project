package com.nemisolv.starter.payload.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response payload for Text-to-Speech synthesis
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TTSResponse {

    private String audioFilePath;

    private String text;

    private String voiceId;

    private Integer durationMs;
}
