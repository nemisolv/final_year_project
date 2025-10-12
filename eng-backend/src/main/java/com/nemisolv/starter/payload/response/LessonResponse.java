package com.nemisolv.starter.payload.response;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Response record for lesson operations
 * Perfect use case for record: immutable, simple data carrier
 */
public record LessonResponse(
    @JsonProperty("lessonId") String lessonId,
    @JsonProperty("lessonTitle") String lessonTitle,
    @JsonProperty("status") String status,
    @JsonProperty("timestamp") Long timestamp,
    @JsonProperty("difficulty") String difficulty,
    @JsonProperty("score") Integer score,
    @JsonProperty("timeSpent") Integer timeSpent
) {
    
    // Factory methods for common responses
    public static LessonResponse started(String lessonId, String lessonTitle, String difficulty) {
        return new LessonResponse(
            lessonId, lessonTitle, "started", System.currentTimeMillis(), difficulty, null, null
        );
    }
    
    public static LessonResponse completed(String lessonId, String lessonTitle, int score, int timeSpent) {
        return new LessonResponse(
            lessonId, lessonTitle, "completed", System.currentTimeMillis(), null, score, timeSpent
        );
    }
}
