// eng-backend/src/main/java/com/nemisolv/starter/service/ChatAIService.java
package com.nemisolv.starter.service;

import com.nemisolv.starter.payload.ai.ChatRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

@Service
public class ChatAIService {

    private final WebClient webClient;

    public ChatAIService(WebClient.Builder webClientBuilder, @Value("${ai.service.url}") String aiServiceUrl) {
        this.webClient = webClientBuilder.baseUrl(aiServiceUrl).build();
    }

    public Flux<String> getChatStream(ChatRequest chatRequest) {
        return this.webClient.post()
                .uri("/chat/stream")
                .bodyValue(chatRequest)
                .retrieve()
                .bodyToFlux(String.class);
    }
}