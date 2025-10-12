package com.nemisolv.starter.annotation.audit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation for automatic audit logging
 * Usage: @AuditLog(action = "USER_LOGIN", resource = "USER")
 */
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface AuditLog {
    
    /**
     * The action being performed (e.g., USER_LOGIN, LESSON_STARTED)
     */
    String action();
    
    /**
     * The resource type (e.g., USER, LESSON, QUIZ)
     */
    String resource() default "";
    
    /**
     * The resource ID parameter name (e.g., "userId", "lessonId")
     */
    String resourceId() default "";
    
    /**
     * Additional metadata to include in audit log
     */
    String[] metadata() default {};
    
    /**
     * Whether to log on success only (true) or both success/failure (false)
     */
    boolean successOnly() default false;
}
