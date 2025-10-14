package com.nemisolv.starter.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private Long id;
    private Integer userId;
    private String role; // "user" or "assistant"
    private String content;
    private LocalDateTime createdAt;
    private String sessionId; // Optional: to group related conversations

    public static ChatMessage fromRs(ResultSet rs) throws SQLException {
        ChatMessage message = new ChatMessage();
        message.setId(rs.getLong("id"));
        message.setUserId(rs.getInt("user_id"));
        message.setRole(rs.getString("role"));
        message.setContent(rs.getString("content"));
        message.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        message.setSessionId(rs.getString("session_id"));
        return message;
    }
}
