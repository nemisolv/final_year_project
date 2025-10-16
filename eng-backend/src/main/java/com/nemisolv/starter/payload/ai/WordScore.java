package com.nemisolv.starter.payload.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Word-level pronunciation score details
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WordScore {

    private String word;

    private Double score;  // 0-100

    private Double pronunciationAccuracy;

    private Double fluencyScore;

    private String feedback;
}
