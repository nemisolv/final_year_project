package com.nemisolv.starter.controller;

import com.nemisolv.starter.annotation.audit.LearningAudit;
import com.nemisolv.starter.annotation.audit.ProgressAudit;
import com.nemisolv.starter.annotation.audit.AIAudit;
import com.nemisolv.starter.payload.ApiResponse;
import com.nemisolv.starter.payload.ai.ChatRequest;
import com.nemisolv.starter.payload.ai.ChatResponse;
import com.nemisolv.starter.payload.response.LessonResponse;
import com.nemisolv.starter.payload.response.QuizResponse;
import com.nemisolv.starter.payload.response.ProgressResponse;
import com.nemisolv.starter.payload.response.AIResponse;

import com.nemisolv.starter.service.ChatAIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for learning activities with comprehensive audit logging
 * Demonstrates how audit service supports AI analytics for personalized learning
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/learning")
@Slf4j
public class LearningController {
    
    private final ChatAIService chatAIService;
    /**
     * Start a lesson - logs learning activity for AI analysis
     */
    @PostMapping("/lessons/{lessonId}/start")
    @LearningAudit(
        activityType = LearningAudit.ActivityType.LESSON_STARTED,
        contentId = "lessonId",
        contentTitle = "lessonTitle",
        contentType = "LESSON",
        difficulty = "difficulty"
    )
    public ApiResponse<LessonResponse> startLesson(
            @PathVariable String lessonId,
            @RequestParam(required = false) String difficulty,
            @AuthenticationPrincipal Jwt jwt) {
        
        String lessonTitle = "Lesson " + lessonId; // In real app, fetch from database
        
        LessonResponse response = LessonResponse.started(lessonId, lessonTitle, difficulty != null ? difficulty : "INTERMEDIATE");
        
        log.info("User started lesson {}", lessonId);
        return ApiResponse.success(response);
    }
    
    /**
     * Complete a lesson - logs completion data for AI analysis
     */
    @PostMapping("/lessons/{lessonId}/complete")
    @LearningAudit(
        activityType = LearningAudit.ActivityType.LESSON_COMPLETED,
        contentId = "lessonId",
        contentTitle = "lessonTitle",
        contentType = "LESSON",
        score = "score",
        timeSpent = "timeSpent"
    )
    public ApiResponse<LessonResponse> completeLesson(
            @PathVariable String lessonId,
            @RequestParam int score,
            @RequestParam int timeSpent,
            @AuthenticationPrincipal Jwt jwt) {
        
        String lessonTitle = "Lesson " + lessonId;
        
        LessonResponse response = LessonResponse.completed(lessonId, lessonTitle, score, timeSpent);
        
        log.info("User completed lesson {} with score {}", lessonId, score);
        return ApiResponse.success(response);
    }
    
    /**
     * Attempt a quiz - logs quiz performance for AI analysis
     */
    @PostMapping("/quizzes/{quizId}/attempt")
    @LearningAudit(
        activityType = LearningAudit.ActivityType.QUIZ_ATTEMPTED,
        contentId = "quizId",
        contentTitle = "quizTitle",
        contentType = "QUIZ",
        score = "score"
    )
    public ApiResponse<QuizResponse> attemptQuiz(
            @PathVariable String quizId,
            @RequestParam int score,
            @RequestParam int totalQuestions,
            @AuthenticationPrincipal Jwt jwt) {
        
        String quizTitle = "Quiz " + quizId;
        
        QuizResponse response = QuizResponse.completed(quizId, quizTitle, score, totalQuestions);
        
        log.info("User attempted quiz {} with score {}/{}", quizId, score, totalQuestions);
        return ApiResponse.success(response);
    }
    
    /**
     * Watch a video - logs video consumption for AI analysis
     */
    @PostMapping("/videos/{videoId}/watch")
    @LearningAudit(
        activityType = LearningAudit.ActivityType.VIDEO_WATCHED,
        contentId = "videoId",
        contentTitle = "videoTitle",
        contentType = "VIDEO",
        timeSpent = "watchDuration"
    )
    public ApiResponse<Map<String, Object>> watchVideo(
            @PathVariable String videoId,
            @RequestParam int watchDuration,
            @RequestParam int totalDuration,
            @AuthenticationPrincipal Jwt jwt) {
        
        
        Map<String, Object> response = new HashMap<>();
        response.put("videoId", videoId);
        response.put("watchDuration", watchDuration);
        response.put("totalDuration", totalDuration);
        response.put("completionPercentage", (watchDuration * 100) / totalDuration);
        
        log.info("User watched video {} for {}/{} seconds", videoId, watchDuration, totalDuration);
        return ApiResponse.success(response);
    }
    
    /**
     * AI interaction endpoint - logs AI queries for analytics
     */
    @PostMapping("/ai/interact")
    @AIAudit(
        interactionType = AIAudit.InteractionType.QUERY,
        query = "requestBody.query",
        response = "response",
        responseTime = "responseTime"
    )
    public ApiResponse<AIResponse> interactWithAI(
            @RequestBody Map<String, String> requestBody,
            @AuthenticationPrincipal Jwt jwt) {
        
        String query = requestBody.get("query");
        String interactionType = requestBody.get("type");
        
        // Simulate AI response
        String response = "AI response for: " + query;
        int responseTime = 150; // milliseconds
        
        AIResponse responseData = AIResponse.chat(query, response, responseTime, interactionType);
        
        log.info("User interacted with AI: {}", query);
        return ApiResponse.success(responseData);
    }
    
    /**
     * Get AI recommendation - logs recommendation acceptance
     */
    @PostMapping("/ai/recommendation")
    @AIAudit(
        interactionType = AIAudit.InteractionType.RECOMMENDATION,
        recommendationType = "requestBody.type",
        recommendationContent = "content",
        accepted = "requestBody.accepted"
    )
    public ApiResponse<AIResponse> getAIRecommendation(
            @RequestBody Map<String, String> requestBody,
            @AuthenticationPrincipal Jwt jwt) {
        
        String recommendationType = requestBody.get("type");
        String content = "Recommended lesson for your level";
        boolean accepted = Boolean.parseBoolean(requestBody.get("accepted"));
        
        AIResponse response = AIResponse.recommendation(recommendationType, content, accepted);
        
        log.info("User received AI recommendation: {} (accepted: {})", recommendationType, accepted);
        return ApiResponse.success(response);
    }
    
    /**
     * Submit user feedback - logs feedback for AI improvement
     */
    @PostMapping("/feedback")
    @AIAudit(
        interactionType = AIAudit.InteractionType.FEEDBACK,
        feedbackType = "requestBody.type",
        feedbackContent = "requestBody.content",
        rating = "requestBody.rating"
    )
    public ApiResponse<AIResponse> submitFeedback(
            @RequestBody Map<String, Object> requestBody,
            @AuthenticationPrincipal Jwt jwt) {
        
        String feedbackType = (String) requestBody.get("type");
        String content = (String) requestBody.get("content");
        Integer rating = (Integer) requestBody.get("rating");
        
        AIResponse response = AIResponse.feedback(feedbackType, content, rating);
        
        log.info("User submitted feedback: {} (rating: {})", feedbackType, rating);
        return ApiResponse.success(response);
    }
    
    /**
     * Update learning streak - logs streak data for motivation analytics
     */
    @PostMapping("/streak/update")
    @ProgressAudit(
        progressType = ProgressAudit.ProgressType.STREAK_UPDATE,
        currentStreak = "currentStreak",
        longestStreak = "longestStreak"
    )
    public ApiResponse<ProgressResponse> updateStreak(
            @RequestParam int currentStreak,
            @RequestParam int longestStreak,
            @AuthenticationPrincipal Jwt jwt) {
        
        ProgressResponse response = ProgressResponse.streakUpdate(currentStreak, longestStreak);
        
        log.info("User streak updated: current={}, longest={}", currentStreak, longestStreak);
        return ApiResponse.success(response);
    }
    
    /**
     * Achieve milestone - logs achievement for gamification analytics
     */
    @PostMapping("/milestones/achieve")
    @ProgressAudit(
        progressType = ProgressAudit.ProgressType.MILESTONE_ACHIEVED,
        milestone = "milestone",
        milestoneDescription = "description"
    )
    public ApiResponse<ProgressResponse> achieveMilestone(
            @RequestParam String milestone,
            @RequestParam String description,
            @AuthenticationPrincipal Jwt jwt) {
        
        ProgressResponse response = ProgressResponse.milestoneAchieved(milestone, description);
        
        log.info("User achieved milestone: {}", milestone);
        return ApiResponse.success(response);
    }




}
