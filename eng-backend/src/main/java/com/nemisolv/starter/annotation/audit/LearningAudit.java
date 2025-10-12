package com.nemisolv.starter.annotation.audit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Specialized annotation for learning activities
 * Automatically extracts learning-specific data for audit logging
 */
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface LearningAudit {
    
    /**
     * The learning activity type
     */
    ActivityType activityType();
    
    /**
     * The content ID parameter name (e.g., "lessonId", "quizId")
     */
    String contentId() default "";
    
    /**
     * The content title parameter name or static value
     */
    String contentTitle() default "";
    
    /**
     * The content type (LESSON, QUIZ, VIDEO, EXERCISE)
     */
    String contentType() default "";
    
    /**
     * The difficulty parameter name
     */
    String difficulty() default "";
    
    /**
     * The score parameter name
     */
    String score() default "";
    
    /**
     * The time spent parameter name
     */
    String timeSpent() default "";
    
    enum ActivityType {
        LESSON_STARTED,
        LESSON_COMPLETED,
        QUIZ_ATTEMPTED,
        VIDEO_WATCHED,
        EXERCISE_COMPLETED
    }
}
