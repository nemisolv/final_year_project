package com.nemisolv.starter.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation for method-level permission checking
 * Usage: @RequirePermission("USER_CREATE") or @RequirePermission(resource = "USER", action = "CREATE")
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {
    
    /**
     * The permission name (e.g., "USER_CREATE")
     */
    String value() default "";
    
    /**
     * The resource type (e.g., "USER", "LESSON")
     */
    String resource() default "";
    
    /**
     * The action (e.g., "CREATE", "READ", "UPDATE", "DELETE")
     */
    String action() default "";
    
    /**
     * Whether to require ALL permissions (AND) or ANY permission (OR)
     * Default is ANY (OR)
     */
    boolean requireAll() default false;
}
