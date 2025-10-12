package com.nemisolv.starter.controller;

import com.nemisolv.starter.payload.ApiResponse;
import com.nemisolv.starter.service.AuthorizationService;
import com.nemisolv.starter.service.RbacService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for permission-related operations
 * Provides endpoints for clients to check user permissions
 */
@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
@Slf4j
public class PermissionController {

    private final AuthorizationService authorizationService;
    private final RbacService rbacService;

    /**
     * Get current user's roles and permissions
     * This endpoint is used by the frontend to determine what UI elements to show
     *
     * Response format:
     * {
     *   "STUDENT": ["LESSON_READ", "PROGRESS_READ", "PROGRESS_UPDATE", ...],
     *   "TEACHER": ["LESSON_CREATE", "LESSON_UPDATE", ...]
     * }
     */
    @GetMapping("/me")
    public ApiResponse<Map<String, List<String>>> getCurrentUserPermissions() {
        Integer userId = authorizationService.getCurrentUserId();
        Map<String, List<String>> rolePermissions = rbacService.getRolePermissionNameForUser(userId);

        log.debug("Retrieved permissions for user {}: {}", userId, rolePermissions);
        return ApiResponse.success(rolePermissions);
    }

    /**
     * Check if current user has a specific permission
     * Useful for conditional UI rendering when you need to check one specific permission
     *
     * @param permission Permission name to check (e.g., "USER_CREATE", "LESSON_UPDATE")
     */
    @GetMapping("/check")
    public ApiResponse<PermissionCheckResponse> checkPermission(@RequestParam String permission) {
        boolean hasPermission = authorizationService.hasPermission(permission);

        return ApiResponse.success(PermissionCheckResponse.builder()
                .permission(permission)
                .granted(hasPermission)
                .build());
    }

    /**
     * Check multiple permissions at once
     * More efficient than making multiple single-permission checks
     *
     * @param permissions Comma-separated list of permissions to check
     */
    @GetMapping("/check-multiple")
    public ApiResponse<Map<String, Boolean>> checkMultiplePermissions(
            @RequestParam String permissions) {

        String[] permissionArray = permissions.split(",");
        Map<String, Boolean> results = new java.util.HashMap<>();

        for (String permission : permissionArray) {
            String trimmedPermission = permission.trim();
            results.put(trimmedPermission, authorizationService.hasPermission(trimmedPermission));
        }

        return ApiResponse.success(results);
    }

    /**
     * Check if current user has a specific role
     *
     * @param role Role name to check (e.g., "ADMIN", "TEACHER", "STUDENT")
     */
    @GetMapping("/check-role")
    public ApiResponse<RoleCheckResponse> checkRole(@RequestParam String role) {
        boolean hasRole = authorizationService.hasRole(role);

        return ApiResponse.success(RoleCheckResponse.builder()
                .role(role)
                .granted(hasRole)
                .build());
    }

    /**
     * Get all unique permissions for current user (flattened list)
     * Useful for simpler permission checks in the frontend
     */
    @GetMapping("/me/flat")
    public ApiResponse<UserPermissionsResponse> getCurrentUserPermissionsFlat() {
        Integer userId = authorizationService.getCurrentUserId();
        Map<String, List<String>> rolePermissions = rbacService.getRolePermissionNameForUser(userId);

        // Flatten to get all unique permissions
        List<String> allPermissions = rolePermissions.values().stream()
                .flatMap(List::stream)
                .distinct()
                .sorted()
                .toList();

        // Get all role names
        List<String> roles = rolePermissions.keySet().stream()
                .sorted()
                .toList();

        return ApiResponse.success(UserPermissionsResponse.builder()
                .userId(userId)
                .roles(roles)
                .permissions(allPermissions)
                .rolePermissions(rolePermissions)
                .build());
    }

    // ==================== Response DTOs ====================

    @lombok.Builder
    @lombok.Getter
    @lombok.Setter
    public static class PermissionCheckResponse {
        private String permission;
        private boolean granted;
    }

    @lombok.Builder
    @lombok.Getter
    @lombok.Setter
    public static class RoleCheckResponse {
        private String role;
        private boolean granted;
    }

    @lombok.Builder
    @lombok.Getter
    @lombok.Setter
    public static class UserPermissionsResponse {
        private Integer userId;
        private List<String> roles;
        private List<String> permissions;
        private Map<String, List<String>> rolePermissions;
    }
}
