package com.nemisolv.starter.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nemisolv.starter.entity.AuditLog;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Implementation of AuditLogRepository
 * Provides database operations for audit logs with AI analysis support
 */
@Repository
@RequiredArgsConstructor
@Slf4j
public class AuditLogRepository {
    
    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    private final ObjectMapper objectMapper;
    
    private static final String INSERT_SQL = """
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, status, error_message, 
                               ip_address, user_agent, session_id, request_id, metadata, old_values, 
                               new_values, event_timestamp, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;
    
    private static final String SELECT_BASE = """
        SELECT id, user_id, action, resource_type, resource_id, status, error_message,
               ip_address, user_agent, session_id, request_id, metadata, old_values,
               new_values, event_timestamp, created_at
        FROM audit_logs
        """;
    
    public void save(AuditLog auditLog) {
        try {
            jdbcTemplate.update(INSERT_SQL,
                auditLog.getUserId(),
                auditLog.getAction(),
                auditLog.getResourceType(),
                auditLog.getResourceId(),
                auditLog.getStatus(),
                auditLog.getErrorMessage(),
                auditLog.getIpAddress(),
                auditLog.getUserAgent(),
                auditLog.getSessionId(),
                auditLog.getRequestId(),
                mapToJson(auditLog.getMetadata()),
                mapToJson(auditLog.getOldValues()),
                mapToJson(auditLog.getNewValues()),
                auditLog.getEventTimestamp(),
                auditLog.getCreatedAt()
            );
            log.debug("Saved audit log: {} for user: {}", auditLog.getAction(), auditLog.getUserId());
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", auditLog.getAction(), e);
            throw new RuntimeException("Failed to save audit log", e);
        }
    }
    
    public List<AuditLog> findByUserId(Long userId) {
        String sql = SELECT_BASE + " WHERE user_id = ? ORDER BY event_timestamp DESC";
        return jdbcTemplate.query(sql, this::mapRowToAuditLog, userId);
    }
    

    public List<AuditLog> findByUserIdAndAction(Long userId, String action) {
        String sql = SELECT_BASE + " WHERE user_id = ? AND action = ? ORDER BY event_timestamp DESC";
        return jdbcTemplate.query(sql, this::mapRowToAuditLog, userId, action);
    }
    

    public List<AuditLog> findByAction(String action) {
        String sql = SELECT_BASE + " WHERE action = ? ORDER BY event_timestamp DESC";
        return jdbcTemplate.query(sql, this::mapRowToAuditLog, action);
    }
    

    public List<AuditLog> findByResourceType(String resourceType) {
        String sql = SELECT_BASE + " WHERE resource_type = ? ORDER BY event_timestamp DESC";
        return jdbcTemplate.query(sql, this::mapRowToAuditLog, resourceType);
    }
    

    public List<AuditLog> findByStatus(String status) {
        String sql = SELECT_BASE + " WHERE status = ? ORDER BY event_timestamp DESC";
        return jdbcTemplate.query(sql, this::mapRowToAuditLog, status);
    }
    

    public List<AuditLog> findByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = SELECT_BASE + " WHERE event_timestamp BETWEEN ? AND ? ORDER BY event_timestamp DESC";
        return jdbcTemplate.query(sql, this::mapRowToAuditLog, startDate, endDate);
    }
    

    public List<AuditLog> findByUserIdAndDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        String sql = SELECT_BASE + " WHERE user_id = ? AND event_timestamp BETWEEN ? AND ? ORDER BY event_timestamp DESC";
        return jdbcTemplate.query(sql, this::mapRowToAuditLog, userId, startDate, endDate);
    }
    

    public Map<String, Long> countByActionForUser(Long userId) {
        String sql = """
            SELECT action, COUNT(*) as count 
            FROM audit_logs 
            WHERE user_id = ? 
            GROUP BY action 
            ORDER BY count DESC
            """;
        
        Map<String, Long> result = new HashMap<>();
        jdbcTemplate.query(sql, (rs) -> {
            result.put(rs.getString("action"), rs.getLong("count"));
        }, userId);
        
        return result;
    }
    

    public Map<String, Long> countByAction() {
        String sql = """
            SELECT action, COUNT(*) as count 
            FROM audit_logs 
            GROUP BY action 
            ORDER BY count DESC
            """;
        
        Map<String, Long> result = new HashMap<>();
        jdbcTemplate.query(sql, (rs) -> {
            result.put(rs.getString("action"), rs.getLong("count"));
        });
        
        return result;
    }
    

    public Map<String, Object> getUserActivitySummary(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT 
                COUNT(*) as total_actions,
                COUNT(DISTINCT action) as unique_actions,
                COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) as successful_actions,
                COUNT(CASE WHEN status = 'FAILURE' THEN 1 END) as failed_actions,
                COUNT(CASE WHEN action LIKE '%LOGIN%' THEN 1 END) as login_attempts,
                COUNT(CASE WHEN action LIKE '%LESSON%' THEN 1 END) as lesson_activities,
                COUNT(CASE WHEN action LIKE '%QUIZ%' THEN 1 END) as quiz_activities,
                AVG(CASE WHEN metadata IS NOT NULL AND JSON_EXTRACT(metadata, '$.responseTime') IS NOT NULL 
                    THEN JSON_EXTRACT(metadata, '$.responseTime') END) as avg_response_time
            FROM audit_logs 
            WHERE user_id = ? AND event_timestamp BETWEEN ? AND ?
            """;
        
        return jdbcTemplate.queryForMap(sql, userId, startDate, endDate);
    }
    

    public List<Map<String, Object>> getLearningProgressData(Long userId) {
        String sql = """
            SELECT 
                action,
                resource_id,
                resource_type,
                JSON_EXTRACT(metadata, '$.score') as score,
                JSON_EXTRACT(metadata, '$.timeSpent') as time_spent,
                JSON_EXTRACT(metadata, '$.difficulty') as difficulty,
                event_timestamp
            FROM audit_logs 
            WHERE user_id = ? 
            AND (action LIKE '%LESSON%' OR action LIKE '%QUIZ%' OR action LIKE '%VIDEO%')
            ORDER BY event_timestamp DESC
            """;
        
        return jdbcTemplate.queryForList(sql, userId);
    }
    

    public Map<String, Object> getSystemPerformanceMetrics(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT 
                COUNT(*) as total_events,
                COUNT(DISTINCT user_id) as active_users,
                AVG(CASE WHEN JSON_EXTRACT(metadata, '$.responseTime') IS NOT NULL 
                    THEN JSON_EXTRACT(metadata, '$.responseTime') END) as avg_response_time,
                COUNT(CASE WHEN status = 'ERROR' THEN 1 END) as error_count,
                COUNT(CASE WHEN action LIKE '%LOGIN%' THEN 1 END) as login_events,
                COUNT(CASE WHEN action LIKE '%LESSON%' THEN 1 END) as learning_events
            FROM audit_logs 
            WHERE event_timestamp BETWEEN ? AND ?
            """;
        
        return jdbcTemplate.queryForMap(sql, startDate, endDate);
    }
    

    public List<Map<String, Object>> getErrorPatterns(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT 
                action,
                error_message,
                COUNT(*) as error_count,
                COUNT(DISTINCT user_id) as affected_users
            FROM audit_logs 
            WHERE status = 'ERROR' 
            AND event_timestamp BETWEEN ? AND ?
            GROUP BY action, error_message
            ORDER BY error_count DESC
            """;
        
        return jdbcTemplate.queryForList(sql, startDate, endDate);
    }
    
    private AuditLog mapRowToAuditLog(ResultSet rs, int rowNum) throws SQLException {
        return AuditLog.builder()
            .id(rs.getLong("id"))
            .userId(rs.getLong("user_id"))
            .action(rs.getString("action"))
            .resourceType(rs.getString("resource_type"))
            .resourceId(rs.getString("resource_id"))
            .status(rs.getString("status"))
            .errorMessage(rs.getString("error_message"))
            .ipAddress(rs.getString("ip_address"))
            .userAgent(rs.getString("user_agent"))
            .sessionId(rs.getString("session_id"))
            .requestId(rs.getString("request_id"))
            .metadata(jsonToMap(rs.getString("metadata")))
            .oldValues(jsonToMap(rs.getString("old_values")))
            .newValues(jsonToMap(rs.getString("new_values")))
            .eventTimestamp(rs.getTimestamp("event_timestamp") != null ? 
                rs.getTimestamp("event_timestamp").toLocalDateTime() : null)
            .createdAt(rs.getTimestamp("created_at") != null ? 
                rs.getTimestamp("created_at").toLocalDateTime() : null)
            .build();
    }
    
    private String mapToJson(Map<String, Object> map) {
        if (map == null) return null;
        try {
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            log.error("Failed to convert map to JSON", e);
            return null;
        }
    }
    
    @SuppressWarnings("unchecked")
    private Map<String, Object> jsonToMap(String json) {
        if (json == null || json.trim().isEmpty()) return null;
        try {
            return objectMapper.readValue(json, Map.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to convert JSON to map: {}", json, e);
            return null;
        }
    }
}
