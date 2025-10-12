package com.nemisolv.starter.aspect;

import com.nemisolv.starter.annotation.permission.RequireAnyPermission;
import com.nemisolv.starter.annotation.permission.RequirePermission;
import com.nemisolv.starter.annotation.permission.RequireRole;
import com.nemisolv.starter.service.AuthorizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

/**
 * AOP Aspect for enforcing permission-based access control
 * Intercepts methods annotated with @RequirePermission, @RequireAnyPermission, @RequireRole
 * and verifies permissions in real-time from database
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class PermissionAspect {

    private final AuthorizationService authorizationService;

    /**
     * Enforce @RequirePermission annotation
     */
    @Before("@annotation(com.nemisolv.starter.annotation.permission.RequirePermission)")
    public void checkPermission(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        RequirePermission annotation = method.getAnnotation(RequirePermission.class);

        if (annotation == null) {
            return;
        }

        // Check if permission name is provided
        if (!annotation.permission().isEmpty()) {
            log.debug("Checking permission: {}", annotation.permission());
            // check if the incoming request( user) has the permission
            authorizationService.requirePermission(annotation.permission());
        }
        // Check if resource + action is provided
        else if (!annotation.resource().isEmpty() && !annotation.action().isEmpty()) {
            log.debug("Checking permission: resource={}, action={}", annotation.resource(), annotation.action());
            authorizationService.requirePermission(annotation.resource(), annotation.action());
        }
        else {
            log.error("Invalid @RequirePermission annotation on method {}: must specify either 'permission' or ('resource' + 'action')",
                    method.getName());
            throw new IllegalArgumentException("Invalid @RequirePermission annotation");
        }
    }

    /**
     * Enforce @RequireAnyPermission annotation
     */
    @Before("@annotation(com.nemisolv.starter.annotation.permission.RequireAnyPermission)")
    public void checkAnyPermission(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        RequireAnyPermission annotation = method.getAnnotation(RequireAnyPermission.class);

        if (annotation == null || annotation.permissions().length == 0) {
            log.error("Invalid @RequireAnyPermission annotation on method {}: must specify at least one permission",
                    method.getName());
            throw new IllegalArgumentException("Invalid @RequireAnyPermission annotation");
        }

        log.debug("Checking any permission of: {}", (Object) annotation.permissions());

        // Check if user has any of the specified permissions
        if (!authorizationService.hasAnyPermission(annotation.permissions())) {
            Integer userId = authorizationService.getCurrentUserId();
            log.warn("Access denied: userId={}, requiredAnyPermissions={}", userId, (Object) annotation.permissions());
            authorizationService.requirePermission(annotation.permissions()[0]); // Will throw exception
        }
    }

    /**
     * Enforce @RequireRole annotation
     */
    @Before("@annotation(com.nemisolv.starter.annotation.permission.RequireRole)")
    public void checkRole(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        RequireRole annotation = method.getAnnotation(RequireRole.class);

        if (annotation == null || annotation.role().isEmpty()) {
            log.error("Invalid @RequireRole annotation on method {}: must specify a role", method.getName());
            throw new IllegalArgumentException("Invalid @RequireRole annotation");
        }

        log.debug("Checking role: {}", annotation.role());
        authorizationService.requireRole(annotation.role());
    }
}
