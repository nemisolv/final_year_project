package com.nemisolv.starter.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Entity for audit logs table
 * Designed for AI analysis of user behavior patterns
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    
    private Long id;
    private Long userId;
    private String action;
    private String resourceType;
    private String resourceId;
    private String status;
    private String errorMessage;
    private String ipAddress;
    private String userAgent;
    private String sessionId;
    private String requestId;
    private Map<String, Object> metadata;
    private Map<String, Object> oldValues;
    private Map<String, Object> newValues;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime eventTimestamp;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

}
