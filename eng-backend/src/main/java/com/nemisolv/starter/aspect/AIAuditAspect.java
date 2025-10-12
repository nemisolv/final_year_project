package com.nemisolv.starter.aspect;

import com.nemisolv.starter.annotation.audit.AIAudit;
import com.nemisolv.starter.annotation.audit.AuditLog;
import com.nemisolv.starter.annotation.audit.LearningAudit;
import com.nemisolv.starter.annotation.audit.ProgressAudit;
import com.nemisolv.starter.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.HashMap;
import java.util.Map;

/**
 * AOP Aspect for automatic audit logging
 * Intercepts methods annotated with audit annotations and logs audit events
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AIAuditAspect {
    
    private final AuditService auditService;
    private final AuditContext auditContext;
    
    @Autowired
    private ApplicationContext applicationContext;
    
    /**
     * Handle @AuditLog annotation
     */
    @Around("@annotation(auditLog)")
    public Object handleAuditLog(ProceedingJoinPoint joinPoint, AuditLog auditLog) throws Throwable {
        return executeWithAudit(joinPoint, () -> {
            // Try to get user ID from security context first, fallback to extracting from request
            Long userId = auditContext.getCurrentUserId();
            String action = auditLog.action();
            String resource = auditLog.resource();
            String resourceId = extractResourceId(joinPoint, auditLog.resourceId());
            
            // For login/registration, extract user info from request parameters
            if (userId == null && (action.contains("LOGIN") || action.contains("REGISTRATION"))) {
                userId = extractUserIdFromRequest(joinPoint, action);
            }
            
            // Extract metadata
            Map<String, Object> metadata = extractMetadata(joinPoint, auditLog.metadata());
            
            // Extract request information BEFORE async call
            HttpServletRequest request = auditContext.getCurrentRequest();
            String ipAddress = auditContext.getClientIpAddress(request);
            String userAgent = auditContext.getUserAgent(request);
            String sessionId = auditContext.getSessionId(request);
            
            // Log audit event with extracted request data
            auditService.logWithRequestData(
                action,
                resource,
                resourceId,
                "SUCCESS",
                null,
                metadata,
                userId,
                ipAddress,
                userAgent,
                sessionId
            );
        });
    }
    
    /**
     * Handle @LearningAudit annotation
     */
    @Around("@annotation(learningAudit)")
    public Object handleLearningAudit(ProceedingJoinPoint joinPoint, LearningAudit learningAudit) throws Throwable {
        return executeWithAudit(joinPoint, () -> {
            Long userId = auditContext.getCurrentUserId();
            String contentId = extractParameterValue(joinPoint, learningAudit.contentId());
            String contentTitle = extractParameterValue(joinPoint, learningAudit.contentTitle());
            String difficulty = extractParameterValue(joinPoint, learningAudit.difficulty());
            
            // Extract additional parameters
            String scoreStr = extractParameterValue(joinPoint, learningAudit.score());
            String timeSpentStr = extractParameterValue(joinPoint, learningAudit.timeSpent());
            
            Integer score = scoreStr != null ? Integer.parseInt(scoreStr) : null;
            Integer timeSpent = timeSpentStr != null ? Integer.parseInt(timeSpentStr) : null;
            
            // Log based on activity type
            switch (learningAudit.activityType()) {
                case LESSON_STARTED:
                    auditService.logLessonStarted(userId, contentId, contentTitle, difficulty);
                    break;
                case LESSON_COMPLETED:
                    auditService.logLessonCompleted(userId, contentId, contentTitle, score, timeSpent);
                    break;
                case QUIZ_ATTEMPTED:
                    // Extract total questions from metadata or use default
                    int totalQuestions = extractTotalQuestions(joinPoint);
                    auditService.logQuizAttempted(userId, contentId, contentTitle, score, totalQuestions);
                    break;
                case VIDEO_WATCHED:
                    // Extract total duration from metadata or use default
                    int totalDuration = extractTotalDuration(joinPoint);
                    auditService.logVideoWatched(userId, contentId, contentTitle, timeSpent, totalDuration);
                    break;
                case EXERCISE_COMPLETED:
                    // Handle exercise completion similar to lesson completion
                    auditService.logLessonCompleted(userId, contentId, contentTitle, score, timeSpent);
                    break;
            }
        });
    }
    
    /**
     * Handle @ProgressAudit annotation
     */
    @Around("@annotation(progressAudit)")
    public Object handleProgressAudit(ProceedingJoinPoint joinPoint, ProgressAudit progressAudit) throws Throwable {
        return executeWithAudit(joinPoint, () -> {
            Long userId = auditContext.getCurrentUserId();
            String skill = extractParameterValue(joinPoint, progressAudit.skill());
            String level = extractParameterValue(joinPoint, progressAudit.level());
            String progressPercentageStr = extractParameterValue(joinPoint, progressAudit.progressPercentage());
            String milestone = extractParameterValue(joinPoint, progressAudit.milestone());
            String milestoneDescription = extractParameterValue(joinPoint, progressAudit.milestoneDescription());
            String currentStreakStr = extractParameterValue(joinPoint, progressAudit.currentStreak());
            String longestStreakStr = extractParameterValue(joinPoint, progressAudit.longestStreak());
            
            Integer progressPercentage = progressPercentageStr != null ? Integer.parseInt(progressPercentageStr) : null;
            Integer currentStreak = currentStreakStr != null ? Integer.parseInt(currentStreakStr) : null;
            Integer longestStreak = longestStreakStr != null ? Integer.parseInt(longestStreakStr) : null;
            
            // Log based on progress type
            switch (progressAudit.progressType()) {
                case SKILL_UPDATE:
                    auditService.logProgressUpdate(userId, skill, level, progressPercentage);
                    break;
                case MILESTONE_ACHIEVED:
                    auditService.logMilestoneAchieved(userId, milestone, milestoneDescription);
                    break;
                case STREAK_UPDATE:
                    auditService.logStreakUpdate(userId, currentStreak, longestStreak);
                    break;
                case LEVEL_UP:
                    // Handle level up similar to skill update
                    auditService.logProgressUpdate(userId, skill, level, progressPercentage);
                    break;
            }
        });
    }
    
    /**
     * Handle @AIAudit annotation
     */
    @Around("@annotation(aiAudit)")
    public Object handleAIAudit(ProceedingJoinPoint joinPoint, AIAudit aiAudit) throws Throwable {
        return executeWithAudit(joinPoint, () -> {
            Long userId = auditContext.getCurrentUserId();
            String interactionType = aiAudit.interactionType().name();
            String query = extractParameterValue(joinPoint, aiAudit.query());
            String response = extractParameterValue(joinPoint, aiAudit.response());
            String responseTimeStr = extractParameterValue(joinPoint, aiAudit.responseTime());
            String recommendationType = extractParameterValue(joinPoint, aiAudit.recommendationType());
            String recommendationContent = extractParameterValue(joinPoint, aiAudit.recommendationContent());
            String acceptedStr = extractParameterValue(joinPoint, aiAudit.accepted());
            String feedbackType = extractParameterValue(joinPoint, aiAudit.feedbackType());
            String feedbackContent = extractParameterValue(joinPoint, aiAudit.feedbackContent());
            String ratingStr = extractParameterValue(joinPoint, aiAudit.rating());
            
            Integer responseTime = responseTimeStr != null ? Integer.parseInt(responseTimeStr) : null;
            Boolean accepted = acceptedStr != null ? Boolean.parseBoolean(acceptedStr) : null;
            Integer rating = ratingStr != null ? Integer.parseInt(ratingStr) : null;
            
            // Log based on interaction type
            switch (aiAudit.interactionType()) {
                case QUERY:
                    auditService.logAIInteraction(userId, interactionType, query, response, responseTime);
                    break;
                case RECOMMENDATION:
                    auditService.logAIRecommendation(userId, recommendationType, recommendationContent, accepted);
                    break;
                case FEEDBACK:
                    auditService.logUserFeedback(userId, feedbackType, feedbackContent, rating);
                    break;
                case CHAT:
                    // Handle chat similar to query
                    auditService.logAIInteraction(userId, interactionType, query, response, responseTime);
                    break;
            }
        });
    }
    
    /**
     * Execute method with audit logging
     */
    private Object executeWithAudit(ProceedingJoinPoint joinPoint, AuditAction auditAction) throws Throwable {
        try {
            Object result = joinPoint.proceed();
            // Execute audit action asynchronously to avoid blocking the response
            AIAuditAspect self = applicationContext.getBean(AIAuditAspect.class);
            self.executeAuditAsync(auditAction);
            return result;
        } catch (Exception e) {
            // Log error if needed
            log.error("Error in audited method: {}", joinPoint.getSignature().getName(), e);
            throw e;
        }
    }
    
    /**
     * Execute audit action asynchronously
     */
    @Async("auditTaskExecutor")
    public void executeAuditAsync(AuditAction auditAction) {
        try {
            auditAction.execute();
        } catch (Exception e) {
            log.error("Error executing audit action asynchronously", e);
        }
    }
    
    /**
     * Extract resource ID from method parameters
     */
    private String extractResourceId(ProceedingJoinPoint joinPoint, String resourceIdParam) {
        if (resourceIdParam.isEmpty()) {
            return null;
        }
        return extractParameterValue(joinPoint, resourceIdParam);
    }
    
    /**
     * Extract user ID from request parameters for login/registration
     */
    private Long extractUserIdFromRequest(ProceedingJoinPoint joinPoint, String action) {
        try {
            // For login/registration, we don't have user ID yet, so return null
            // The actual user ID will be set after authentication in the service layer
            return null;
        } catch (Exception e) {
            log.debug("Could not extract user ID from request: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Extract metadata from method parameters
     */
    private Map<String, Object> extractMetadata(ProceedingJoinPoint joinPoint, String[] metadataParams) {
        Map<String, Object> metadata = new HashMap<>();
        for (String param : metadataParams) {
            String value = extractParameterValue(joinPoint, param);
            if (value != null) {
                metadata.put(param, value);
            }
        }
        return metadata;
    }
    
    /**
     * Extract parameter value by name from method arguments
     */
    private String extractParameterValue(ProceedingJoinPoint joinPoint, String paramName) {
        if (paramName.isEmpty()) {
            return null;
        }
        
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Parameter[] parameters = method.getParameters();
        Object[] args = joinPoint.getArgs();
        
        for (int i = 0; i < parameters.length; i++) {
            if (parameters[i].getName().equals(paramName)) {
                Object value = args[i];
                return value != null ? value.toString() : null;
            }
        }
        
        return null;
    }
    
    /**
     * Extract total questions from method parameters or use default
     */
    private int extractTotalQuestions(ProceedingJoinPoint joinPoint) {
        String totalQuestionsStr = extractParameterValue(joinPoint, "totalQuestions");
        return totalQuestionsStr != null ? Integer.parseInt(totalQuestionsStr) : 10; // default
    }
    
    /**
     * Extract total duration from method parameters or use default
     */
    private int extractTotalDuration(ProceedingJoinPoint joinPoint) {
        String totalDurationStr = extractParameterValue(joinPoint, "totalDuration");
        return totalDurationStr != null ? Integer.parseInt(totalDurationStr) : 300; // default 5 minutes
    }
    
    /**
     * Functional interface for audit actions
     */
    @FunctionalInterface
    private interface AuditAction {
        void execute();
    }
}
