package com.nemisolv.starter.annotation.audit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Specialized annotation for progress and achievement tracking
 */
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ProgressAudit {
    
    /**
     * The progress type
     */
    ProgressType progressType();
    
    /**
     * The skill parameter name
     */
    String skill() default "";
    
    /**
     * The level parameter name
     */
    String level() default "";
    
    /**
     * The progress percentage parameter name
     */
    String progressPercentage() default "";
    
    /**
     * The milestone parameter name
     */
    String milestone() default "";
    
    /**
     * The milestone description parameter name
     */
    String milestoneDescription() default "";
    
    /**
     * The current streak parameter name
     */
    String currentStreak() default "";
    
    /**
     * The longest streak parameter name
     */
    String longestStreak() default "";
    
    enum ProgressType {
        SKILL_UPDATE,
        MILESTONE_ACHIEVED,
        STREAK_UPDATE,
        LEVEL_UP
    }
}
