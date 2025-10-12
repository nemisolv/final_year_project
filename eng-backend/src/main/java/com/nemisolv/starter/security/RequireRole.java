package com.nemisolv.starter.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation for method-level role checking
 * Usage: @RequireRole("ADMIN") or @RequireRole({"ADMIN", "TEACHER"})
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {
    
    /**
     * The role names required
     */
    String[] value();
    
    /**
     * Whether to require ALL roles (AND) or ANY role (OR)
     * Default is ANY (OR)
     */
    boolean requireAll() default false;
}
