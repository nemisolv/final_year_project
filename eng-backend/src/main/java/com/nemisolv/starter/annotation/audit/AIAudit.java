package com.nemisolv.starter.annotation.audit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Specialized annotation for AI interactions
 */
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface AIAudit {
    
    /**
     * The AI interaction type
     */
    InteractionType interactionType();
    
    /**
     * The query parameter name
     */
    String query() default "";
    
    /**
     * The response parameter name
     */
    String response() default "";
    
    /**
     * The response time parameter name
     */
    String responseTime() default "";
    
    /**
     * The recommendation type parameter name
     */
    String recommendationType() default "";
    
    /**
     * The recommendation content parameter name
     */
    String recommendationContent() default "";
    
    /**
     * The accepted parameter name
     */
    String accepted() default "";
    
    /**
     * The feedback type parameter name
     */
    String feedbackType() default "";
    
    /**
     * The feedback content parameter name
     */
    String feedbackContent() default "";
    
    /**
     * The rating parameter name
     */
    String rating() default "";
    
    enum InteractionType {
        QUERY,
        RECOMMENDATION,
        FEEDBACK,
        CHAT
    }
}
