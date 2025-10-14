package com.nemisolv.starter.repository;

import com.nemisolv.starter.entity.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.List;

@Repository
@Slf4j
@RequiredArgsConstructor
public class ChatMessageRepository {

    @Qualifier("mariadbJdbcTemplate")
    private final JdbcTemplate jdbcTemplate;

    /**
     * Save a chat message to database for training/audit purposes
     */
    public Long save(ChatMessage message) {
        String sql = "INSERT INTO chat_messages (user_id, role, content, created_at, session_id) " +
                     "VALUES (?, ?, ?, ?, ?)";

        try {
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                ps.setInt(1, message.getUserId());
                ps.setString(2, message.getRole());
                ps.setString(3, message.getContent());
                ps.setObject(4, message.getCreatedAt() != null ? message.getCreatedAt() : LocalDateTime.now());
                ps.setString(5, message.getSessionId());
                return ps;
            }, keyHolder);

            Number key = keyHolder.getKey();
            return key != null ? key.longValue() : null;
        } catch (Exception e) {
            log.error("Error saving chat message for user {}: {}", message.getUserId(), e.getMessage());
            throw new RuntimeException("Failed to save chat message", e);
        }
    }

    /**
     * Get chat history for a user
     */
    public List<ChatMessage> findByUserId(Integer userId, int limit) {
        String sql = "SELECT * FROM chat_messages WHERE user_id = ? " +
                     "ORDER BY created_at DESC LIMIT ?";

        try {
            return jdbcTemplate.query(sql,
                (rs, rowNum) -> ChatMessage.fromRs(rs),
                userId, limit);
        } catch (Exception e) {
            log.error("Error fetching chat history for user {}: {}", userId, e.getMessage());
            return List.of();
        }
    }

    /**
     * Get chat messages by session ID
     */
    public List<ChatMessage> findBySessionId(String sessionId) {
        String sql = "SELECT * FROM chat_messages WHERE session_id = ? " +
                     "ORDER BY created_at ASC";

        try {
            return jdbcTemplate.query(sql,
                (rs, rowNum) -> ChatMessage.fromRs(rs),
                sessionId);
        } catch (Exception e) {
            log.error("Error fetching chat session {}: {}", sessionId, e.getMessage());
            return List.of();
        }
    }

    /**
     * Count total messages for a user
     */
    public long countByUserId(Integer userId) {
        String sql = "SELECT COUNT(*) FROM chat_messages WHERE user_id = ?";
        try {
            Long count = jdbcTemplate.queryForObject(sql, Long.class, userId);
            return count != null ? count : 0;
        } catch (Exception e) {
            log.error("Error counting messages for user {}: {}", userId, e.getMessage());
            return 0;
        }
    }
}
