package com.nemisolv.starter.annotation.permission;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to require ANY of the specified permissions for method execution
 * User needs at least one of the listed permissions
 * <p>
 * Usage example:
 * @@RequireAnyPermission(permissions = {"USER_READ", "USER_UPDATE", "USER_DELETE"})
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireAnyPermission {

    /**
     * List of permission names - user needs at least one of these
     */
    String[] permissions();
}
