package com.nemisolv.starter.service;

import com.nemisolv.starter.payload.ai.PronunciationRequest;
import com.nemisolv.starter.payload.ai.PronunciationResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * Service for Pronunciation Assessment integration with AI service
 * Handles communication with Azure Pronunciation Assessment via AI service
 */
@Service
@Slf4j
public class PronunciationAIService {

    private final WebClient webClient;

    public PronunciationAIService(WebClient.Builder webClientBuilder,
                                 @Value("${ai.service.url}") String aiServiceUrl) {
        this.webClient = webClientBuilder.baseUrl(aiServiceUrl).build();
        log.info("PronunciationAIService initialized with AI service URL: {}", aiServiceUrl);
    }

    /**
     * Analyze pronunciation from audio file
     *
     * @param request Pronunciation request with target text and audio path
     * @return PronunciationResponse with scores and feedback
     */
    public PronunciationResponse analyzePronunciation(PronunciationRequest request) {
        log.info("Requesting pronunciation analysis for target text: '{}'", request.getTargetText());

        try {
            PronunciationResponse response = webClient.post()
                    .uri("/api/v1/pronunciation/analyze")
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, clientResponse ->
                            clientResponse.bodyToMono(String.class).flatMap(errorBody -> {
                                log.error("Pronunciation analysis failed with 4xx error: {}", errorBody);
                                return Mono.error(new RuntimeException("Pronunciation request failed: " + errorBody));
                            }))
                    .onStatus(HttpStatusCode::is5xxServerError, clientResponse ->
                            clientResponse.bodyToMono(String.class).flatMap(errorBody -> {
                                log.error("Pronunciation analysis failed with 5xx error: {}", errorBody);
                                return Mono.error(new RuntimeException("Pronunciation service error: " + errorBody));
                            }))
                    .bodyToMono(PronunciationResponse.class)
                    .block();

            log.info("Pronunciation analysis successful. Overall score: {}/100, Recognized: '{}'",
                    response.getOverallScore(), response.getRecognizedText());

            // Log detailed word scores
            if (response.getWordScores() != null && !response.getWordScores().isEmpty()) {
                log.debug("Word-level scores:");
                response.getWordScores().forEach(wordScore ->
                        log.debug("  '{}': {}/100 - {}",
                                wordScore.getWord(),
                                wordScore.getScore(),
                                wordScore.getFeedback())
                );
            }

            return response;

        } catch (Exception e) {
            log.error("Error calling Pronunciation AI service", e);
            throw new RuntimeException("Failed to analyze pronunciation: " + e.getMessage(), e);
        }
    }

    /**
     * Check if pronunciation analysis service is available
     *
     * @return true if service is available
     */
    public boolean isServiceAvailable() {
        try {
            webClient.get()
                    .uri("/health")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            return true;
        } catch (Exception e) {
            log.warn("Pronunciation AI service is not available", e);
            return false;
        }
    }
}
