package com.nemisolv.starter.controller;

import com.nemisolv.starter.payload.ai.ChatRequest;
import com.nemisolv.starter.security.UserPrincipal;
import com.nemisolv.starter.service.ChatAIService;
import com.nemisolv.starter.service.ChatMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.util.stream.Collectors;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ChatController {
    private final ChatMessageService chatMessageService;
    private final ChatAIService chatAIService;

    @PostMapping(value = "/chat-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("isAuthenticated()")
    public Flux<String> handleChatStream(@Valid @RequestBody ChatRequest chatRequest, @AuthenticationPrincipal UserPrincipal currentUser) {

        // 1. Tiền xử lý: Lấy tin nhắn cuối cùng của user và lưu vào DB
        chatRequest.getMessages().stream()
                .filter(msg -> "user".equalsIgnoreCase(msg.getRole()))
                .reduce((first, second) -> second) // Lấy message cuối cùng
                .ifPresent(userMessage -> chatMessageService.saveUserMessage(userMessage.getContent(), currentUser));

        // 2. Gọi AI service và stream kết quả
        Flux<String> aiStream = chatAIService.getChatStream(chatRequest);

        // 3. Hậu xử lý: Thu thập kết quả stream và lưu câu trả lời của AI
        return aiStream.collect(Collectors.joining())
                .doOnSuccess(fullResponse -> {
                    chatMessageService.saveAssistantMessage(fullResponse, currentUser);
                })
                .flatMapMany(fullResponse -> aiStream); // Trả về stream gốc cho client
    }
}
