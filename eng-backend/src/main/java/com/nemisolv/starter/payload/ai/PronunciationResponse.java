package com.nemisolv.starter.payload.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response payload for pronunciation assessment
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PronunciationResponse {

    private String recognizedText;

    private List<WordScore> wordScores;

    private Double overallScore;  // 0-100

    private Double wordErrorRate;

    private List<String> feedback;
}
