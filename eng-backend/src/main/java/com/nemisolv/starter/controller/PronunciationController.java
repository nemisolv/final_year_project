package com.nemisolv.starter.controller;

import com.nemisolv.starter.payload.ai.PronunciationRequest;
import com.nemisolv.starter.payload.ai.PronunciationResponse;
import com.nemisolv.starter.security.UserPrincipal;
import com.nemisolv.starter.service.PronunciationAIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for Pronunciation Assessment functionality
 * Provides endpoints for pronunciation analysis using Azure Pronunciation Assessment
 */
@RestController
@RequestMapping("/api/v1/ai/pronunciation")
@RequiredArgsConstructor
@Slf4j
public class PronunciationController {

    private final PronunciationAIService pronunciationAIService;

    /**
     * Analyze pronunciation from audio recording
     *
     * POST /api/ai/pronunciation/analyze
     *
     * Request body:
     * {
     *   "targetText": "Hello, how are you?",
     *   "audioPath": "/path/to/audio.wav"
     * }
     *
     * Response:
     * {
     *   "recognizedText": "Hello how are you",
     *   "overallScore": 85.5,
     *   "wordErrorRate": 0.05,
     *   "wordScores": [
     *     {
     *       "word": "Hello",
     *       "score": 92.0,
     *       "pronunciationAccuracy": 92.0,
     *       "fluencyScore": 88.0,
     *       "feedback": "Excellent pronunciation!"
     *     },
     *     ...
     *   ],
     *   "feedback": [
     *     "Very good pronunciation overall. Minor adjustments on some words.",
     *     "Try to speak more smoothly and at a steady pace."
     *   ]
     * }
     */
    @PostMapping("/analyze")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PronunciationResponse> analyzePronunciation(
            @Valid @RequestBody PronunciationRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("User {} requesting pronunciation analysis for target text: '{}'",
                currentUser.getId(),
                request.getTargetText());

        // Set user ID for tracking
        request.setUserId(currentUser.getId());

        PronunciationResponse response = pronunciationAIService.analyzePronunciation(request);

        log.info("Pronunciation analysis completed for user {}. Overall score: {}/100",
                currentUser.getId(),
                response.getOverallScore());

        return ResponseEntity.ok(response);
    }

    /**
     * Check if pronunciation analysis service is available
     *
     * GET /api/ai/pronunciation/health
     *
     * Response:
     * {
     *   "available": true,
     *   "message": "Pronunciation analysis service is available"
     * }
     */
    @GetMapping("/health")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> checkServiceHealth(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("User {} checking pronunciation service health", currentUser.getId());

        boolean available = pronunciationAIService.isServiceAvailable();

        return ResponseEntity.ok(new HealthResponse(
                available,
                available ? "Pronunciation analysis service is available" :
                           "Pronunciation analysis service is unavailable"
        ));
    }

    /**
     * Health response class
     */
    private record HealthResponse(boolean available, String message) {}
}
