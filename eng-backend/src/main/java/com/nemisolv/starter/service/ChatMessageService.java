package com.nemisolv.starter.service;

import com.nemisolv.starter.entity.ChatMessage;
import com.nemisolv.starter.repository.ChatMessageRepository;
import com.nemisolv.starter.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;

    /**
     * Save user message to database for training/audit purposes
     */
    public void saveUserMessage(String content, UserPrincipal currentUser) {
        try {
            ChatMessage message = ChatMessage.builder()
                    .userId(currentUser.getId())
                    .role("user")
                    .content(content)
                    .createdAt(LocalDateTime.now())
                    .sessionId(generateSessionId(currentUser.getId()))
                    .build();

            chatMessageRepository.save(message);
            log.info("Saved user message from user {}", currentUser.getId());
        } catch (Exception e) {
            log.error("Failed to save user message for user {}: {}", currentUser.getId(), e.getMessage());
        }
    }

    /**
     * Save assistant (AI) message to database for training/audit purposes
     */
    public void saveAssistantMessage(String content, UserPrincipal currentUser) {
        try {
            ChatMessage message = ChatMessage.builder()
                    .userId(currentUser.getId())
                    .role("assistant")
                    .content(content)
                    .createdAt(LocalDateTime.now())
                    .sessionId(generateSessionId(currentUser.getId()))
                    .build();

            chatMessageRepository.save(message);
            log.info("Saved assistant message for user {}", currentUser.getId());
        } catch (Exception e) {
            log.error("Failed to save assistant message for user {}: {}", currentUser.getId(), e.getMessage());
        }
    }

    /**
     * Generate a simple session ID based on user ID and current date
     * This groups messages from the same user on the same day
     */
    private String generateSessionId(Integer userId) {
        String dateStr = LocalDateTime.now().toLocalDate().toString();
        return userId + "-" + dateStr;
    }
}