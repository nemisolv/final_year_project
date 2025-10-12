package com.nemisolv.starter.security;

import com.nemisolv.starter.service.RbacService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * AOP Aspect for RBAC authorization
 * Intercepts methods annotated with @RequirePermission and @RequireRole
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class RbacAspect {
    
    private final RbacService rbacService;
    
    /**
     * Handle @RequirePermission annotation
     */
    @Around("@annotation(requirePermission)")
    public Object handleRequirePermission(ProceedingJoinPoint joinPoint, RequirePermission requirePermission) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        
        log.debug("Checking permission for method: {}.{}", className, methodName);
        
        // Get current user
        Integer userId = getCurrentUserId();
        if (userId == null) {
            throw new SecurityException("User not authenticated");
        }
        
        // Check permission
        boolean hasPermission = checkPermission(userId, requirePermission);
        
        if (!hasPermission) {
            log.warn("Access denied for user {} to method {}.{}", userId, className, methodName);
            throw new SecurityException("Access denied: Insufficient permissions");
        }
        
        log.debug("Permission granted for user {} to method {}.{}", userId, className, methodName);
        return joinPoint.proceed();
    }
    
    /**
     * Handle @RequireRole annotation
     */
    @Around("@annotation(requireRole)")
    public Object handleRequireRole(ProceedingJoinPoint joinPoint, RequireRole requireRole) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        
        log.debug("Checking role for method: {}.{}", className, methodName);
        
        // Get current user
        Integer userId = getCurrentUserId();
        if (userId == null) {
            throw new SecurityException("User not authenticated");
        }
        
        // Check role
        boolean hasRole = checkRole(userId, requireRole);
        
        if (!hasRole) {
            log.warn("Access denied for user {} to method {}.{}", userId, className, methodName);
            throw new SecurityException("Access denied: Insufficient role");
        }
        
        log.debug("Role granted for user {} to method {}.{}", userId, className, methodName);
        return joinPoint.proceed();
    }
    
    /**
     * Get current user ID from security context
     */
    private Integer getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
                Jwt jwt = (Jwt) authentication.getPrincipal();
                Object userIdObj = jwt.getClaim("userId");
                return userIdObj instanceof Number ? ((Number) userIdObj).intValue() : null;
            }
        } catch (Exception e) {
            log.debug("Could not extract user ID from security context: {}", e.getMessage());
        }
        return null;
    }
    
    /**
     * Check if user has required permission
     */
    private boolean checkPermission(Integer userId, RequirePermission requirePermission) {
        try {
            // Check by permission name
            if (!requirePermission.value().isEmpty()) {
                return rbacService.userHasPermission(userId, requirePermission.value());
            }
            
        // Check by resource type and action
        if (!requirePermission.resource().isEmpty() && !requirePermission.action().isEmpty()) {
            return rbacService.userHasPermission(userId, requirePermission.resource(), requirePermission.action());
        }
            
            log.warn("Invalid @RequirePermission annotation: must specify either 'value' or both 'resource' and 'action'");
            return false;
            
        } catch (Exception e) {
            log.error("Error checking permission for user {}: {}", userId, e.getMessage());
            return false;
        }
    }
    
    /**
     * Check if user has required role
     */
    private boolean checkRole(Integer userId, RequireRole requireRole) {
        try {
            String[] requiredRoles = requireRole.value();
            if (requiredRoles.length == 0) {
                log.warn("No roles specified in @RequireRole annotation");
                return false;
            }
            
            if (requireRole.requireAll()) {
                // User must have ALL roles
                for (String role : requiredRoles) {
                    if (!rbacService.userHasRole(userId, role)) {
                        return false;
                    }
                }
                return true;
            } else {
                // User must have ANY role
                for (String role : requiredRoles) {
                    if (rbacService.userHasRole(userId, role)) {
                        return true;
                    }
                }
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error checking role for user {}: {}", userId, e.getMessage());
            return false;
        }
    }
}
