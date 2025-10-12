package com.nemisolv.starter.payload.response;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Response record for quiz operations
 * Perfect use case for record: immutable, simple data carrier
 */
public record QuizResponse(
    @JsonProperty("quizId") String quizId,
    @JsonProperty("quizTitle") String quizTitle,
    @JsonProperty("score") Integer score,
    @JsonProperty("totalQuestions") Integer totalQuestions,
    @JsonProperty("percentage") Integer percentage,
    @JsonProperty("status") String status
) {
    
    // Factory method for quiz completion
    public static QuizResponse completed(String quizId, String quizTitle, int score, int totalQuestions) {
        int percentage = totalQuestions > 0 ? (score * 100) / totalQuestions : 0;
        return new QuizResponse(
            quizId, quizTitle, score, totalQuestions, percentage, "completed"
        );
    }
}
