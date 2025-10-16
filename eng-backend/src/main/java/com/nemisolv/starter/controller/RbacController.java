package com.nemisolv.starter.controller;

import com.nemisolv.starter.entity.Permission;
import com.nemisolv.starter.entity.Role;
import com.nemisolv.starter.enums.RoleName;
import com.nemisolv.starter.payload.ApiResponse;
import com.nemisolv.starter.security.RequirePermission;
import com.nemisolv.starter.security.RequireRole;
import com.nemisolv.starter.service.RbacService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * RBAC Management Controller
 * Provides endpoints for managing roles, permissions, and access control
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/rbac")
@Slf4j
public class RbacController {
    
    private final RbacService rbacService;
    
    // ========== PERMISSION MANAGEMENT ==========
    
    /**
     * Create a new permission
     */
    @PostMapping("/permissions")
    @RequireRole({"ADMIN"})
    public ApiResponse<Permission> createPermission(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String description = request.get("description");
        String resourceType = request.get("resourceType");
        String action = request.get("action");
        
        Permission permission = rbacService.createPermission(name, description, resourceType, action);
        log.info("Created permission: {}", name);
        
        return ApiResponse.success(permission);
    }
    
    /**
     * Get all permissions
     */
    @GetMapping("/permissions")
    @RequirePermission("USER_READ")
    public ApiResponse<List<Permission>> getAllPermissions() {
        List<Permission> permissions = rbacService.getAllPermissions();
        return ApiResponse.success(permissions);
    }
    
    /**
     * Get permission by name
     */
    @GetMapping("/permissions/{name}")
    @RequirePermission("USER_READ")
    public ApiResponse<Permission> getPermissionByName(@PathVariable String name) {
        Permission permission = rbacService.getPermissionByName(name);
        return ApiResponse.success(permission);
    }
    
    /**
     * Get permissions by resource type
     */
    @GetMapping("/permissions/resource/{resourceType}")
    @RequirePermission("USER_READ")
    public ApiResponse<List<Permission>> getPermissionsByResource(@PathVariable String resourceType) {
        List<Permission> permissions = rbacService.getPermissionsByResource(resourceType);
        return ApiResponse.success(permissions);
    }
    
    /**
     * Update permission
     */
    @PutMapping("/permissions/{id}")
    @RequireRole({"ADMIN"})
    public ApiResponse<Permission> updatePermission(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        String name = request.get("name");
        String description = request.get("description");
        
        Permission permission = rbacService.updatePermission(id, name, description);
        log.info("Updated permission: {}", id);
        
        return ApiResponse.success(permission);
    }
    
    /**
     * Delete permission
     */
    @DeleteMapping("/permissions/{id}")
    @RequireRole({"ADMIN"})
    public ApiResponse<Void> deletePermission(@PathVariable Long id) {
        rbacService.deletePermission(id);
        log.info("Deleted permission: {}", id);
        
        return ApiResponse.success(null);
    }
    
    // ========== ROLE MANAGEMENT ==========
    
    /**
     * Create a new role
     */
    @PostMapping("/roles")
    @RequireRole({"ADMIN"})
    public ApiResponse<Role> createRole(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String description = request.get("description");
        
        Role role = rbacService.createRole(name, description);
        log.info("Created role: {}", name);
        
        return ApiResponse.success(role);
    }
    
    /**
     * Get all roles
     */
    @GetMapping("/roles")
    @RequirePermission("USER_READ")
    public ApiResponse<List<Role>> getAllRoles() {
        List<Role> roles = rbacService.getAllRoles();
        return ApiResponse.success(roles);
    }
    
    /**
     * Get role by name
     */
    @GetMapping("/roles/{name}")
    @RequirePermission("USER_READ")
    public ApiResponse<Role> getRoleByName(@PathVariable String name) {
        Role role = rbacService.getRoleByName(name);
        return ApiResponse.success(role);
    }
    
    /**
     * Update role
     */
    @PutMapping("/roles/{id}")
    @RequireRole({"ADMIN"})
    public ApiResponse<Role> updateRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        String name = request.get("name");
        String description = request.get("description");
        
        Role role = rbacService.updateRole(id, name, description);
        log.info("Updated role: {}", id);
        
        return ApiResponse.success(role);
    }
    
    /**
     * Delete role
     */
    @DeleteMapping("/roles/{id}")
    @RequireRole({"ADMIN"})
    public ApiResponse<Void> deleteRole(@PathVariable Long id) {
        rbacService.deleteRole(id);
        log.info("Deleted role: {}", id);
        
        return ApiResponse.success(null);
    }
    
    // ========== ROLE-PERMISSION MAPPING ==========
    
    /**
     * Assign permission to role
     */
    @PostMapping("/roles/{roleId}/permissions/{permissionId}")
    @RequireRole({"ADMIN"})
    public ApiResponse<Map<String, String>> assignPermissionToRole(
            @PathVariable Long roleId,
            @PathVariable Long permissionId) {
        
        rbacService.assignPermissionToRole(roleId, permissionId);
        log.info("Assigned permission {} to role {}", permissionId, roleId);
        
        return ApiResponse.success(Map.of("message", "Permission assigned successfully"));
    }
    
    /**
     * Remove permission from role
     */
    @DeleteMapping("/roles/{roleId}/permissions/{permissionId}")
    @RequireRole({"ADMIN"})
    public ApiResponse<Map<String, String>> removePermissionFromRole(
            @PathVariable Long roleId,
            @PathVariable Long permissionId) {
        
        rbacService.removePermissionFromRole(roleId, permissionId);
        log.info("Removed permission {} from role {}", permissionId, roleId);
        
        return ApiResponse.success(Map.of("message", "Permission removed successfully"));
    }
    
    /**
     * Get permissions for role
     */
    @GetMapping("/roles/{roleId}/permissions")
    @RequirePermission("USER_READ")
    public ApiResponse<List<Permission>> getPermissionsForRole(@PathVariable Long roleId) {
        List<Permission> permissions = rbacService.getPermissionsForRole(roleId);
        return ApiResponse.success(permissions);
    }
    
    /**
     * Get permissions for role by name
     */
    @GetMapping("/roles/{roleName}/permissions")
    @RequirePermission("USER_READ")
    public ApiResponse<List<Permission>> getPermissionsForRoleByName(@PathVariable String roleName) {
        List<Permission> permissions = rbacService.getPermissionsForRole(roleName);
        return ApiResponse.success(permissions);
    }
    
    // ========== USER-ROLE MAPPING ==========
    
    /**
     * Assign role to user
     */
    @PostMapping("/users/{userId}/roles/{roleId}")
    @RequireRole({"ADMIN"})
    public ApiResponse<Map<String, String>> assignRoleToUser(
            @PathVariable Integer userId,
            @PathVariable Long roleId) {
        
        rbacService.assignRoleToUser(userId, roleId);
        log.info("Assigned role {} to user {}", roleId, userId);
        
        return ApiResponse.success(Map.of("message", "Role assigned successfully"));
    }
    
    /**
     * Assign role to user by name
     */
    @PostMapping("/users/{userId}/roles/name/{roleName}")
    @RequireRole({"ADMIN"})
    public ApiResponse<Map<String, String>> assignRoleToUserByName(
            @PathVariable Integer userId,
            @PathVariable String roleName) {

        RoleName roleNameEnum = RoleName.valueOf(roleName.toUpperCase());
        rbacService.assignRoleToUser(userId, roleNameEnum);
        log.info("Assigned role {} to user {}", roleName, userId);

        return ApiResponse.success(Map.of("message", "Role assigned successfully"));
    }
    
    /**
     * Remove role from user
     */
    @DeleteMapping("/users/{userId}/roles/{roleId}")
    @RequireRole({"ADMIN"})
    public ApiResponse<Map<String, String>> removeRoleFromUser(
            @PathVariable Integer userId,
            @PathVariable Long roleId) {
        
        rbacService.removeRoleFromUser(userId, roleId);
        log.info("Removed role {} from user {}", roleId, userId);
        
        return ApiResponse.success(Map.of("message", "Role removed successfully"));
    }
    
    /**
     * Get roles for user
     */
    @GetMapping("/users/{userId}/roles")
    @RequirePermission("USER_READ")
    public ApiResponse<List<Role>> getRolesForUser(@PathVariable Integer userId) {
        List<Role> roles = rbacService.getRolesForUser(userId);
        return ApiResponse.success(roles);
    }
    
    /**
     * Get roles for current user
     */
    @GetMapping("/users/me/roles")
    @RequirePermission("USER_READ")
    public ApiResponse<List<Role>> getMyRoles(@AuthenticationPrincipal Jwt jwt) {
        Object userIdObj = jwt.getClaim("userId");
        Integer userId = userIdObj instanceof Number ? ((Number) userIdObj).intValue() : null;
        
        if (userId == null) {
            return ApiResponse.error("User not found");
        }
        
        List<Role> roles = rbacService.getRolesForUser(userId);
        return ApiResponse.success(roles);
    }
    
    // ========== ACCESS CONTROL ==========
    
    /**
     * Check if user has permission
     */
    @GetMapping("/users/{userId}/permissions/{permissionName}")
    @RequirePermission("USER_READ")
    public ApiResponse<Map<String, Boolean>> userHasPermission(
            @PathVariable Integer userId,
            @PathVariable String permissionName) {
        
        boolean hasPermission = rbacService.userHasPermission(userId, permissionName);
        return ApiResponse.success(Map.of("hasPermission", hasPermission));
    }
    
    /**
     * Check if user has permission for resource type and action
     */
    @GetMapping("/users/{userId}/permissions/{resourceType}/{action}")
    @RequirePermission("USER_READ")
    public ApiResponse<Map<String, Boolean>> userHasPermissionForResource(
            @PathVariable Integer userId,
            @PathVariable String resourceType,
            @PathVariable String action) {
        
        boolean hasPermission = rbacService.userHasPermission(userId, resourceType, action);
        return ApiResponse.success(Map.of("hasPermission", hasPermission));
    }
    
    /**
     * Get all permissions for user
     */
    @GetMapping("/users/{userId}/permissions")
    @RequirePermission("USER_READ")
    public ApiResponse<List<Permission>> getPermissionsForUser(@PathVariable Integer userId) {
        List<Permission> permissions = rbacService.getPermissionsForUser(userId);
        return ApiResponse.success(permissions);
    }
    
    /**
     * Get all permissions for current user
     */
    @GetMapping("/users/me/permissions")
    @RequirePermission("USER_READ")
    public ApiResponse<List<Permission>> getMyPermissions(@AuthenticationPrincipal Jwt jwt) {
        Object userIdObj = jwt.getClaim("userId");
        Integer userId = userIdObj instanceof Number ? ((Number) userIdObj).intValue() : null;
        
        if (userId == null) {
            return ApiResponse.error("User not found");
        }
        
        List<Permission> permissions = rbacService.getPermissionsForUser(userId);
        return ApiResponse.success(permissions);
    }
    
    // ========== UTILITY ENDPOINTS ==========
    
    /**
     * Initialize default roles and permissions
     */
    @PostMapping("/initialize")
    @RequireRole({"ADMIN"})
    public ApiResponse<Map<String, String>> initializeDefaultRolesAndPermissions() {
        rbacService.initializeDefaultRolesAndPermissions();
        log.info("Initialized default roles and permissions");
        
        return ApiResponse.success(Map.of("message", "Default roles and permissions initialized"));
    }
    
    /**
     * Check if current user is admin
     */
    @GetMapping("/users/me/is-admin")
    @RequirePermission("USER_READ")
    public ApiResponse<Map<String, Boolean>> isCurrentUserAdmin(@AuthenticationPrincipal Jwt jwt) {
        Object userIdObj = jwt.getClaim("userId");
        Integer userId = userIdObj instanceof Number ? ((Number) userIdObj).intValue()  : null;
        
        if (userId == null) {
            return ApiResponse.error("User not found");
        }
        
        boolean isAdmin = rbacService.isAdmin(userId);
        return ApiResponse.success(Map.of("isAdmin", isAdmin));
    }
    
    /**
     * Check if current user is teacher
     */
    @GetMapping("/users/me/is-teacher")
    @RequirePermission("USER_READ")
    public ApiResponse<Map<String, Boolean>> isCurrentUserTeacher(@AuthenticationPrincipal Jwt jwt) {
        Object userIdObj = jwt.getClaim("userId");
        Integer userId = userIdObj instanceof Number ? ((Number) userIdObj).intValue() : null;
        
        if (userId == null) {
            return ApiResponse.error("User not found");
        }
        
        boolean isTeacher = rbacService.isTeacher(userId);
        return ApiResponse.success(Map.of("isTeacher", isTeacher));
    }
    
    /**
     * Check if current user is student
     */
    @GetMapping("/users/me/is-student")
    @RequirePermission("USER_READ")
    public ApiResponse<Map<String, Boolean>> isCurrentUserStudent(@AuthenticationPrincipal Jwt jwt) {
        Object userIdObj = jwt.getClaim("userId");
        Integer userId = userIdObj instanceof Number ? ((Number) userIdObj).intValue() : null;
        
        if (userId == null) {
            return ApiResponse.error("User not found");
        }
        
        boolean isStudent = rbacService.isStudent(userId);
        return ApiResponse.success(Map.of("isStudent", isStudent));
    }
}
