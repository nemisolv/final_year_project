package com.nemisolv.starter.service;

import com.nemisolv.starter.entity.AuditLog;
import com.nemisolv.starter.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {
    
    private final AuditLogRepository auditLogRepository;
    
    
    @Async("auditTaskExecutor")
    public void logLessonStarted(Long userId, String lessonId, String lessonTitle, String difficulty) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("lessonTitle", lessonTitle);
            metadata.put("difficulty", difficulty);
            
            AuditLog auditLog = createAuditLog(
                userId, 
                "LESSON_STARTED", 
                "LESSON", 
                lessonId, 
                "SUCCESS", 
                null, 
                null, 
                null, 
                null, 
                metadata
            );
            auditLogRepository.save(auditLog);
            log.info("Logged lesson started event for user: {}, lesson: {}", userId, lessonId);
        } catch (Exception e) {
            log.error("Failed to log lesson started event for user: {}, lesson: {}", userId, lessonId, e);
        }
    }
    
    @Async("auditTaskExecutor")
    public void logLessonCompleted(Long userId, String lessonId, String lessonTitle, int score, int timeSpent) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("lessonTitle", lessonTitle);
            metadata.put("score", score);
            metadata.put("timeSpent", timeSpent);
            
            AuditLog auditLog = createAuditLog(
                userId, 
                "LESSON_COMPLETED", 
                "LESSON", 
                lessonId, 
                "SUCCESS", 
                null, 
                null, 
                null, 
                null, 
                metadata
            );
            auditLogRepository.save(auditLog);
            log.info("Logged lesson completed event for user: {}, lesson: {}, score: {}", userId, lessonId, score);
        } catch (Exception e) {
            log.error("Failed to log lesson completed event for user: {}, lesson: {}", userId, lessonId, e);
        }
    }
    
    @Async("auditTaskExecutor")
    public void logQuizAttempted(Long userId, String quizId, String quizTitle, int score, int totalQuestions) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("quizTitle", quizTitle);
            metadata.put("score", score);
            metadata.put("totalQuestions", totalQuestions);
            
            AuditLog auditLog = createAuditLog(
                userId, 
                "QUIZ_ATTEMPTED", 
                "QUIZ", 
                quizId, 
                "SUCCESS", 
                null, 
                null, 
                null, 
                null, 
                metadata
            );
            auditLogRepository.save(auditLog);
            log.info("Logged quiz attempted event for user: {}, quiz: {}, score: {}/{}", userId, quizId, score, totalQuestions);
        } catch (Exception e) {
            log.error("Failed to log quiz attempted event for user: {}, quiz: {}", userId, quizId, e);
        }
    }
    
    @Async("auditTaskExecutor")
    public void logVideoWatched(Long userId, String videoId, String videoTitle, int watchDuration, int totalDuration) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("videoTitle", videoTitle);
            metadata.put("watchDuration", watchDuration);
            metadata.put("totalDuration", totalDuration);
            
            AuditLog auditLog = createAuditLog(
                userId, 
                "VIDEO_WATCHED", 
                "VIDEO", 
                videoId, 
                "SUCCESS", 
                null, 
                null, 
                null, 
                null, 
                metadata
            );
            auditLogRepository.save(auditLog);
            log.info("Logged video watched event for user: {}, video: {}, duration: {}/{}", userId, videoId, watchDuration, totalDuration);
        } catch (Exception e) {
            log.error("Failed to log video watched event for user: {}, video: {}", userId, videoId, e);
        }
    }
    
    @Async("auditTaskExecutor")
    public void logProgressUpdate(Long userId, String skill, String level, int progressPercentage) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("skill", skill);
            metadata.put("level", level);
            metadata.put("progressPercentage", progressPercentage);
            
            AuditLog auditLog = createAuditLog(
                userId, 
                "PROGRESS_UPDATE", 
                "PROGRESS", 
                skill, 
                "SUCCESS", 
                null, 
                null, 
                null, 
                null, 
                metadata
            );
            auditLogRepository.save(auditLog);
            log.info("Logged progress update event for user: {}, skill: {}, level: {}, progress: {}%", userId, skill, level, progressPercentage);
        } catch (Exception e) {
            log.error("Failed to log progress update event for user: {}, skill: {}", userId, skill, e);
        }
    }
    
    public void logMilestoneAchieved(Long userId, String milestone, String description) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("milestone", milestone);
            metadata.put("description", description);
            
            AuditLog auditLog = createAuditLog(
                userId, 
                "MILESTONE_ACHIEVED", 
                "PROGRESS", 
                milestone, 
                "SUCCESS", 
                null, 
                null, 
                null, 
                null, 
                metadata
            );
            auditLogRepository.save(auditLog);
            log.info("Logged milestone achieved event for user: {}, milestone: {}", userId, milestone);
        } catch (Exception e) {
            log.error("Failed to log milestone achieved event for user: {}, milestone: {}", userId, milestone, e);
        }
    }
    
    public void logStreakUpdate(Long userId, int currentStreak, int longestStreak) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("currentStreak", currentStreak);
            metadata.put("longestStreak", longestStreak);
            
            AuditLog auditLog = createAuditLog(
                userId, 
                "STREAK_UPDATE", 
                "PROGRESS", 
                userId.toString(), 
                "SUCCESS", 
                null, 
                null, 
                null, 
                null, 
                metadata
            );
            auditLogRepository.save(auditLog);
            log.info("Logged streak update event for user: {}, current: {}, longest: {}", userId, currentStreak, longestStreak);
        } catch (Exception e) {
            log.error("Failed to log streak update event for user: {}", userId, e);
        }
    }
    
    public void logAIInteraction(Long userId, String interactionType, String query, String response, int responseTime) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("interactionType", interactionType);
            metadata.put("query", query);
            metadata.put("response", response);
            metadata.put("responseTime", responseTime);
            
            AuditLog auditLog = createAuditLog(
                userId, 
                "AI_INTERACTION", 
                "AI", 
                interactionType, 
                "SUCCESS", 
                null, 
                null, 
                null, 
                null, 
                metadata
            );
            auditLogRepository.save(auditLog);
            log.info("Logged AI interaction event for user: {}, type: {}, responseTime: {}ms", userId, interactionType, responseTime);
        } catch (Exception e) {
            log.error("Failed to log AI interaction event for user: {}, type: {}", userId, interactionType, e);
        }
    }
    
    public void logAIRecommendation(Long userId, String recommendationType, String content, boolean accepted) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("recommendationType", recommendationType);
            metadata.put("content", content);
            metadata.put("accepted", accepted);
            
            AuditLog auditLog = createAuditLog(
                userId, 
                "AI_RECOMMENDATION", 
                "AI", 
                recommendationType, 
                "SUCCESS", 
                null, 
                null, 
                null, 
                null, 
                metadata
            );
            auditLogRepository.save(auditLog);
            log.info("Logged AI recommendation event for user: {}, type: {}, accepted: {}", userId, recommendationType, accepted);
        } catch (Exception e) {
            log.error("Failed to log AI recommendation event for user: {}, type: {}", userId, recommendationType, e);
        }
    }
    
    public void logUserFeedback(Long userId, String feedbackType, String content, int rating) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("feedbackType", feedbackType);
            metadata.put("content", content);
            metadata.put("rating", rating);
            
            AuditLog auditLog = createAuditLog(
                userId, 
                "USER_FEEDBACK", 
                "AI", 
                feedbackType, 
                "SUCCESS", 
                null, 
                null, 
                null, 
                null, 
                metadata
            );
            auditLogRepository.save(auditLog);
            log.info("Logged user feedback event for user: {}, type: {}, rating: {}", userId, feedbackType, rating);
        } catch (Exception e) {
            log.error("Failed to log user feedback event for user: {}, type: {}", userId, feedbackType, e);
        }
    }
    
    public void logSystemError(String errorType, String errorMessage, String stackTrace, Long userId) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("errorType", errorType);
            metadata.put("stackTrace", stackTrace);
            
            AuditLog auditLog = createAuditLog(
                userId, 
                "SYSTEM_ERROR", 
                "SYSTEM", 
                errorType, 
                "ERROR", 
                errorMessage, 
                null, 
                null, 
                null, 
                metadata
            );
            auditLogRepository.save(auditLog);
            log.info("Logged system error event: {}, user: {}", errorType, userId);
        } catch (Exception e) {
            log.error("Failed to log system error event: {}", errorType, e);
        }
    }
    
    public void logPerformanceMetric(String metricName, long duration, String details) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("metricName", metricName);
            metadata.put("duration", duration);
            metadata.put("details", details);
            
            AuditLog auditLog = createAuditLog(
                null, 
                "PERFORMANCE_METRIC", 
                "SYSTEM", 
                metricName, 
                "SUCCESS", 
                null, 
                null, 
                null, 
                null, 
                metadata
            );
            auditLogRepository.save(auditLog);
            log.info("Logged performance metric: {}, duration: {}ms", metricName, duration);
        } catch (Exception e) {
            log.error("Failed to log performance metric: {}", metricName, e);
        }
    }
    
    
    public void logWithRequestContext(String action, String resource, String resourceId,
                                    String status, String errorMessage, Object metadata, 
                                    HttpServletRequest request, Long userId) {
        try {
            String ipAddress = getClientIpAddress(request);
            String userAgent = request.getHeader("User-Agent");
            String sessionId = request.getSession() != null ? request.getSession().getId() : null;
            
            AuditLog auditLog = createAuditLog(
                userId, 
                action, 
                resource, 
                resourceId, 
                status, 
                errorMessage, 
                ipAddress, 
                userAgent, 
                sessionId, 
                metadata instanceof Map ? (Map<String, Object>) metadata : null
            );
            
            auditLogRepository.save(auditLog);
            log.info("Logged audit event with request context: {} for user: {}", action, userId);
        } catch (Exception e) {
            log.error("Failed to log audit event with request context: {}", action, e);
        }
    }
    
    public void logWithRequestData(String action, String resource, String resourceId,
                                 String status, String errorMessage, Object metadata, 
                                 Long userId, String ipAddress, String userAgent, String sessionId) {
        try {
            AuditLog auditLog = createAuditLog(
                userId, 
                action, 
                resource, 
                resourceId, 
                status, 
                errorMessage, 
                ipAddress, 
                userAgent, 
                sessionId, 
                metadata instanceof Map ? (Map<String, Object>) metadata : null
            );
            
            auditLogRepository.save(auditLog);
            log.info("Logged audit event with request data: {} for user: {}", action, userId);
        } catch (Exception e) {
            log.error("Failed to log audit event with request data: {}", action, e);
        }
    }
    
    /**
     * Helper method to create AuditLog entity
     */
    private AuditLog createAuditLog(Long userId, String action, String resourceType, String resourceId,
                                  String status, String errorMessage, String ipAddress, String userAgent,
                                  String sessionId, Map<String, Object> metadata) {
        return AuditLog.builder()
            .userId(userId)
            .action(action)
            .resourceType(resourceType)
            .resourceId(resourceId)
            .status(status)
            .errorMessage(errorMessage)
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .sessionId(sessionId)
            .requestId(UUID.randomUUID().toString())
            .metadata(metadata)
            .eventTimestamp(LocalDateTime.now())
            .createdAt(LocalDateTime.now())
            .build();
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
    
}