package com.nemisolv.starter.service;

import com.nemisolv.starter.security.UserPrincipal;
import org.springframework.stereotype.Service;

@Service
public class ChatMessageService {
    
    // @Autowired các repository cần thiết
    
    public void saveUserMessage(String content, UserPrincipal currentUser) {
        // Logic để lưu tin nhắn của người dùng vào DB
        System.out.println("Saving user message from " + currentUser.getUsername() + ": " + content);
    }
    
    public void saveAssistantMessage(String content, UserPrincipal currentUser) {
        // Logic để lưu tin nhắn của AI vào DB
        System.out.println("Saving assistant message for " + currentUser.getUsername() + ": " + content);
    }
}