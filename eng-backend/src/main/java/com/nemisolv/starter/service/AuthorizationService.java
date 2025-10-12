package com.nemisolv.starter.service;

import com.nemisolv.starter.enums.ApiResponseCode;
import com.nemisolv.starter.exception.auth.AuthenticationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

/**
 * Service for real-time authorization checks
 * Verifies permissions from database instead of JWT to ensure up-to-date access control
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthorizationService {

    private final RbacService rbacService;

    /**
     * Get the current authenticated user's ID from JWT token
     * @return User ID from the current security context
     */
    public Integer getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationException(ApiResponseCode.UNAUTHORIZED, "User not authenticated");
        }

        if (authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt.getClaim("userId");
        }

        throw new AuthenticationException(ApiResponseCode.UNAUTHORIZED, "Invalid authentication token");
    }

    /**
     * Get the current authenticated user's email from JWT token
     * @return Email from the current security context
     */
    public String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationException(ApiResponseCode.UNAUTHORIZED, "User not authenticated");
        }

        if (authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt.getClaim("email");
        }

        throw new AuthenticationException(ApiResponseCode.UNAUTHORIZED, "Invalid authentication token");
    }

    /**
     * Check if current user has a specific permission (verified from database)
     * @param permissionName Permission name to check
     * @return true if user has the permission
     */
    public boolean hasPermission(String permissionName) {
        try {
            Integer userId = getCurrentUserId();
            boolean hasPermission = rbacService.userHasPermission(userId, permissionName);
            log.debug("Permission check: userId={}, permission={}, granted={}", userId, permissionName, hasPermission);
            return hasPermission;
        } catch (Exception e) {
            log.warn("Permission check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Check if current user has a specific permission for a resource and action
     * @param resourceType Resource type (e.g., "USER", "LESSON")
     * @param action Action (e.g., "CREATE", "READ", "UPDATE", "DELETE")
     * @return true if user has the permission
     */
    public boolean hasPermission(String resourceType, String action) {
        try {
            Integer userId = getCurrentUserId();
            boolean hasPermission = rbacService.userHasPermission(userId, resourceType, action);
            log.debug("Permission check: userId={}, resource={}, action={}, granted={}",
                    userId, resourceType, action, hasPermission);
            return hasPermission;
        } catch (Exception e) {
            log.warn("Permission check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Check if current user has ANY of the specified permissions
     * @param permissionNames Permission names to check
     * @return true if user has at least one of the permissions
     */
    public boolean hasAnyPermission(String... permissionNames) {
        for (String permissionName : permissionNames) {
            if (hasPermission(permissionName)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if current user has ALL of the specified permissions
     * @param permissionNames Permission names to check
     * @return true if user has all the permissions
     */
    public boolean hasAllPermissions(String... permissionNames) {
        for (String permissionName : permissionNames) {
            if (!hasPermission(permissionName)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if current user has a specific role
     * @param roleName Role name to check
     * @return true if user has the role
     */
    public boolean hasRole(String roleName) {
        try {
            Integer userId = getCurrentUserId();
            boolean hasRole = rbacService.userHasRole(userId, roleName);
            log.debug("Role check: userId={}, role={}, granted={}", userId, roleName, hasRole);
            return hasRole;
        } catch (Exception e) {
            log.warn("Role check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Check if current user has ANY of the specified roles
     * @param roleNames Role names to check
     * @return true if user has at least one of the roles
     */
    public boolean hasAnyRole(String... roleNames) {
        for (String roleName : roleNames) {
            if (hasRole(roleName)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Require that the current user has a specific permission
     * Throws an exception if the user doesn't have the permission
     * @param permissionName Permission name to require
     */
    public void requirePermission(String permissionName) {
        if (!hasPermission(permissionName)) {
            Integer userId = getCurrentUserId();
            log.warn("Access denied: userId={}, requiredPermission={}", userId, permissionName);
            throw new AuthenticationException(ApiResponseCode.ACCESS_DENIED,
                    "You don't have permission: " + permissionName);
        }
    }

    /**
     * Require that the current user has a specific permission for a resource
     * @param resourceType Resource type
     * @param action Action
     */
    public void requirePermission(String resourceType, String action) {
        if (!hasPermission(resourceType, action)) {
            Integer userId = getCurrentUserId();
            log.warn("Access denied: userId={}, requiredResource={}, requiredAction={}",
                    userId, resourceType, action);
            throw new AuthenticationException(ApiResponseCode.ACCESS_DENIED,
                    "You don't have permission to " + action + " " + resourceType);
        }
    }

    /**
     * Require that the current user has a specific role
     * @param roleName Role name to require
     */
    public void requireRole(String roleName) {
        if (!hasRole(roleName)) {
            Integer userId = getCurrentUserId();
            log.warn("Access denied: userId={}, requiredRole={}", userId, roleName);
            throw new AuthenticationException(ApiResponseCode.ACCESS_DENIED,
                    "You don't have role: " + roleName);
        }
    }

    /**
     * Check if user is admin
     * @return true if current user is admin
     */
    public boolean isAdmin() {
        return hasRole("ADMIN");
    }

    /**
     * Check if user is teacher
     * @return true if current user is teacher
     */
    public boolean isTeacher() {
        return hasRole("TEACHER");
    }

    /**
     * Check if user is student
     * @return true if current user is student
     */
    public boolean isStudent() {
        return hasRole("STUDENT");
    }
}
