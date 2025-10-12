package com.nemisolv.starter.payload.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

/**
 * Request record for quiz attempt
 * Perfect use case for record: immutable, simple data carrier with validation
 */
public record QuizAttemptRequest(
    @JsonProperty("quizId") @NotBlank String quizId,
    @JsonProperty("score") @NotNull @Min(0) @Max(100) Integer score,
    @JsonProperty("totalQuestions") @NotNull @Min(1) Integer totalQuestions,
    @JsonProperty("timeSpent") @NotNull @Min(0) Integer timeSpent
) {
    
    // Validation in compact constructor
    public QuizAttemptRequest {
        if (score > totalQuestions) {
            throw new IllegalArgumentException("Score cannot be greater than total questions");
        }
    }
}
