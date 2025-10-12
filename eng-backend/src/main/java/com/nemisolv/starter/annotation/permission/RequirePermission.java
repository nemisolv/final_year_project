package com.nemisolv.starter.annotation.permission;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to require specific permission for method execution
 * Permissions are verified in real-time from database
 *
 * Usage examples:
 * @@RequirePermission(permission = "USER_CREATE")
 * @@RequirePermission(resource = "LESSON", action = "UPDATE")
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {

    /**
     * Permission name to require (e.g., "USER_CREATE", "LESSON_READ")
     * Either 'permission' OR ('resource' + 'action') must be specified
     */
    String permission() default "";

    /**
     * Resource type (e.g., "USER", "LESSON")
     * Must be used together with 'action'
     */
    String resource() default "";

    /**
     * Action (e.g., "CREATE", "READ", "UPDATE", "DELETE")
     * Must be used together with 'resource'
     */
    String action() default "";
}
