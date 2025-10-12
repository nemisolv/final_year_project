package com.nemisolv.starter.payload.ai;

import java.util.List;
import lombok.Data;

@Data
public class ChatRequest {
    private List<ChatMessage> messages;
}