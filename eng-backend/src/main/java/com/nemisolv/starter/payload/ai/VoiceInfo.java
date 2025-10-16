package com.nemisolv.starter.payload.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Voice information from TTS service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoiceInfo {

    private String voiceId;

    private String name;

    private String category;

    private Map<String, String> labels;
}
