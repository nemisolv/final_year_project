package com.nemisolv.starter.payload.response;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Response record for progress operations
 * Perfect use case for record: immutable, simple data carrier
 */
public record ProgressResponse(
    @JsonProperty("skill") String skill,
    @JsonProperty("level") String level,
    @JsonProperty("progressPercentage") Integer progressPercentage,
    @JsonProperty("currentStreak") Integer currentStreak,
    @JsonProperty("longestStreak") Integer longestStreak,
    @JsonProperty("milestone") String milestone,
    @JsonProperty("milestoneDescription") String milestoneDescription,
    @JsonProperty("status") String status,
    @JsonProperty("timestamp") Long timestamp
) {
    
    // Factory methods for different progress types
    public static ProgressResponse skillUpdate(String skill, String level, int progressPercentage) {
        return new ProgressResponse(
            skill, level, progressPercentage, null, null, null, null, "updated", System.currentTimeMillis()
        );
    }
    
    public static ProgressResponse streakUpdate(int currentStreak, int longestStreak) {
        return new ProgressResponse(
            null, null, null, currentStreak, longestStreak, null, null, "updated", System.currentTimeMillis()
        );
    }
    
    public static ProgressResponse milestoneAchieved(String milestone, String description) {
        return new ProgressResponse(
            null, null, null, null, null, milestone, description, "achieved", System.currentTimeMillis()
        );
    }
}
