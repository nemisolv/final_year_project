package com.nemisolv.starter.payload.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

/**
 * Request record for starting a lesson
 * Perfect use case for record: immutable, simple data carrier
 */
public record LessonStartRequest(
    @JsonProperty("lessonId") @NotBlank String lessonId,
    @JsonProperty("difficulty") String difficulty,
    @JsonProperty("learningPath") String learningPath
) {
    
    // Default constructor with validation
    public LessonStartRequest {
        if (difficulty == null) {
            difficulty = "INTERMEDIATE";
        }
    }
}
