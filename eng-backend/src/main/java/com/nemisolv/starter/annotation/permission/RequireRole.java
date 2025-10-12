package com.nemisolv.starter.annotation.permission;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to require specific role for method execution
 * Roles are verified in real-time from database
 *
 * Usage example:
 * @@RequireRole(role = "ADMIN")
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {

    /**
     * Role name to require (e.g., "ADMIN", "TEACHER", "STUDENT")
     */
    String role();
}
