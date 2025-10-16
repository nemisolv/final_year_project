package com.nemisolv.starter.service;

import com.nemisolv.starter.payload.ai.TTSRequest;
import com.nemisolv.starter.payload.ai.TTSResponse;
import com.nemisolv.starter.payload.ai.VoicesListResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * Service for Text-to-Speech integration with AI service
 * Handles communication with ElevenLabs TTS via AI service
 */
@Service
@Slf4j
public class TTSAIService {

    private final WebClient webClient;

    public TTSAIService(WebClient.Builder webClientBuilder,
                       @Value("${ai.service.url}") String aiServiceUrl) {
        this.webClient = webClientBuilder.baseUrl(aiServiceUrl).build();
        log.info("TTSAIService initialized with AI service URL: {}", aiServiceUrl);
    }

    /**
     * Synthesize speech from text
     *
     * @param request TTS request with text and voice parameters
     * @return TTSResponse with audio file path
     */
    public TTSResponse synthesizeSpeech(TTSRequest request) {
        log.info("Requesting TTS synthesis for text: '{}...'",
                request.getText().substring(0, Math.min(50, request.getText().length())));

        try {
            TTSResponse response = webClient.post()
                    .uri("/api/v1/tts/synthesize")
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, clientResponse ->
                            clientResponse.bodyToMono(String.class).flatMap(errorBody -> {
                                log.error("TTS synthesis failed with 4xx error: {}", errorBody);
                                return Mono.error(new RuntimeException("TTS request failed: " + errorBody));
                            }))
                    .onStatus(HttpStatusCode::is5xxServerError, clientResponse ->
                            clientResponse.bodyToMono(String.class).flatMap(errorBody -> {
                                log.error("TTS synthesis failed with 5xx error: {}", errorBody);
                                return Mono.error(new RuntimeException("TTS service error: " + errorBody));
                            }))
                    .bodyToMono(TTSResponse.class)
                    .block();

            log.info("TTS synthesis successful. Audio file: {}", response.getAudioFilePath());
            return response;

        } catch (Exception e) {
            log.error("Error calling TTS AI service", e);
            throw new RuntimeException("Failed to synthesize speech: " + e.getMessage(), e);
        }
    }

    /**
     * Get list of available voices
     *
     * @return VoicesListResponse with available voices
     */
    public VoicesListResponse getAvailableVoices() {
        log.info("Fetching available TTS voices");

        try {
            VoicesListResponse response = webClient.get()
                    .uri("/api/v1/tts/voices")
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, clientResponse ->
                            clientResponse.bodyToMono(String.class).flatMap(errorBody -> {
                                log.error("Failed to fetch voices with 4xx error: {}", errorBody);
                                return Mono.error(new RuntimeException("Failed to fetch voices: " + errorBody));
                            }))
                    .onStatus(HttpStatusCode::is5xxServerError, clientResponse ->
                            clientResponse.bodyToMono(String.class).flatMap(errorBody -> {
                                log.error("Failed to fetch voices with 5xx error: {}", errorBody);
                                return Mono.error(new RuntimeException("TTS service error: " + errorBody));
                            }))
                    .bodyToMono(VoicesListResponse.class)
                    .block();

            log.info("Successfully fetched {} voices", response.getTotal());
            return response;

        } catch (Exception e) {
            log.error("Error fetching TTS voices", e);
            throw new RuntimeException("Failed to fetch available voices: " + e.getMessage(), e);
        }
    }

    /**
     * Get audio file from AI service
     *
     * @param filename Audio filename
     * @return Audio file as Resource
     */
    public Resource getAudioFile(String filename) {
        log.info("Fetching audio file: {}", filename);

        try {
            Resource resource = webClient.get()
                    .uri("/api/v1/tts/audio/{filename}", filename)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, clientResponse -> {
                        log.error("Audio file not found: {}", filename);
                        return Mono.error(new RuntimeException("Audio file not found: " + filename));
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, clientResponse -> {
                        log.error("Error retrieving audio file: {}", filename);
                        return Mono.error(new RuntimeException("Failed to retrieve audio file"));
                    })
                    .bodyToMono(Resource.class)
                    .block();

            log.info("Audio file retrieved successfully: {}", filename);
            return resource;

        } catch (Exception e) {
            log.error("Error fetching audio file: {}", filename, e);
            throw new RuntimeException("Failed to fetch audio file: " + e.getMessage(), e);
        }
    }

    /**
     * Delete audio file from AI service
     *
     * @param filename Audio filename to delete
     * @return true if deletion was successful
     */
    public boolean deleteAudioFile(String filename) {
        log.info("Deleting audio file: {}", filename);

        try {
            webClient.delete()
                    .uri("/api/v1/tts/audio/{filename}", filename)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, clientResponse -> {
                        log.warn("Audio file not found for deletion: {}", filename);
                        return Mono.empty();
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, clientResponse -> {
                        log.error("Error deleting audio file: {}", filename);
                        return Mono.error(new RuntimeException("Failed to delete audio file"));
                    })
                    .bodyToMono(Void.class)
                    .block();

            log.info("Audio file deleted successfully: {}", filename);
            return true;

        } catch (Exception e) {
            log.error("Error deleting audio file: {}", filename, e);
            return false;
        }
    }
}
