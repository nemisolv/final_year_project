package com.nemisolv.starter.service;

import com.nemisolv.starter.payload.ai.GrammarCheckRequest;
import com.nemisolv.starter.payload.ai.GrammarCheckResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class GrammarAIService {

    private final WebClient webClient;

    public GrammarAIService(WebClient.Builder webClientBuilder, @Value("${ai.service.url}") String aiServiceUrl) {
        this.webClient = webClientBuilder.baseUrl(aiServiceUrl).build();
    }

    public GrammarCheckResponse checkGrammar(GrammarCheckRequest request) {
        log.info("Sending grammar check request to AI service for text: {}", request.getText());

        try {
            Mono<GrammarCheckResponse> responseMono = this.webClient.post()
                    .uri("/api/v1/grammar/check")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(GrammarCheckResponse.class);

            GrammarCheckResponse response = responseMono.block();
            log.info("Received grammar check response with {} errors",
                    response != null && response.getErrors() != null ? response.getErrors().size() : 0);

            return response;
        } catch (Exception e) {
            log.error("Error calling AI service for grammar check: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to check grammar: " + e.getMessage(), e);
        }
    }
}
