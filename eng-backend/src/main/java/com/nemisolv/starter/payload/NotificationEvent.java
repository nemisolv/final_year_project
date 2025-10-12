package com.nemisolv.starter.payload;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Base notification event for email notifications
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class NotificationEvent {
    
    @JsonProperty("email")
    private String email;
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("templateData")
    private Map<String, Object> templateData;
    
    @JsonProperty("timestamp")
    private LocalDateTime timestamp;
    
    @JsonProperty("correlationId")
    private String correlationId;
    
    @JsonProperty("userId")
    private Long userId;
    
    public NotificationEvent(String email, String name) {
        this.email = email;
        this.name = name;
        this.timestamp = LocalDateTime.now();
    }
    
    public NotificationEvent(String email, String name, Map<String, Object> templateData) {
        this.email = email;
        this.name = name;
        this.templateData = templateData;
        this.timestamp = LocalDateTime.now();
    }
}