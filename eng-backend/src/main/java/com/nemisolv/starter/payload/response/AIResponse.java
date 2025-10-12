package com.nemisolv.starter.payload.response;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Response record for AI operations
 * Perfect use case for record: immutable, simple data carrier
 */
public record AIResponse(
    @JsonProperty("query") String query,
    @JsonProperty("response") String response,
    @JsonProperty("responseTime") Integer responseTime,
    @JsonProperty("interactionType") String interactionType,
    @JsonProperty("recommendationType") String recommendationType,
    @JsonProperty("recommendationContent") String recommendationContent,
    @JsonProperty("accepted") Boolean accepted,
    @JsonProperty("feedbackType") String feedbackType,
    @JsonProperty("feedbackContent") String feedbackContent,
    @JsonProperty("rating") Integer rating,
    @JsonProperty("status") String status
) {
    
    // Factory methods for different AI interactions
    public static AIResponse chat(String query, String response, int responseTime, String interactionType) {
        return new AIResponse(
            query, response, responseTime, interactionType, null, null, null, null, null, null, "completed"
        );
    }
    
    public static AIResponse recommendation(String recommendationType, String content, boolean accepted) {
        return new AIResponse(
            null, null, null, null, recommendationType, content, accepted, null, null, null, "recommended"
        );
    }
    
    public static AIResponse feedback(String feedbackType, String content, int rating) {
        return new AIResponse(
            null, null, null, null, null, null, null, feedbackType, content, rating, "received"
        );
    }
}
