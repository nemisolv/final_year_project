package com.nemisolv.starter.payload.ai;

import lombok.Data;

@Data
public class ChatResponse {
    private ChatMessage message;
    // Có thể thêm các trường khác như usage (token used) nếu cần
}