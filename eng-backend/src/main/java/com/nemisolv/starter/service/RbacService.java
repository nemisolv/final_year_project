package com.nemisolv.starter.service;

import com.nemisolv.starter.entity.Permission;
import com.nemisolv.starter.entity.Role;
import com.nemisolv.starter.entity.RolePermission;
import com.nemisolv.starter.entity.User;
import com.nemisolv.starter.enums.RoleName;
import com.nemisolv.starter.repository.PermissionRepository;
import com.nemisolv.starter.repository.RolePermissionRepository;
import com.nemisolv.starter.repository.RoleRepository;
import com.nemisolv.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * RBAC Service Implementation
 * Provides comprehensive role-based access control functionality
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RbacService {
    
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final JdbcTemplate mariadbJdbcTemplate;

    // ========== PERMISSION MANAGEMENT ==========
    
    public Permission createPermission(String name, String description, String resourceType, String action) {
        log.info("Creating permission: {} for resourceType: {} action: {}", name, resourceType, action);
        
        if (permissionRepository.existsByName(name)) {
            throw new IllegalArgumentException("Permission with name " + name + " already exists");
        }
        
        Permission permission = new Permission(name, description, resourceType, action);
        return permissionRepository.save(permission);
    }
    
    @Transactional(readOnly = true)
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Permission getPermissionByName(String name) {
        return permissionRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("Permission not found: " + name));
    }
    
    @Transactional(readOnly = true)
    public List<Permission> getPermissionsByResource(String resourceType) {
        return permissionRepository.findByResource(resourceType);
    }
    
    public Permission updatePermission(Long permissionId, String name, String description) {
        log.info("Updating permission: {}", permissionId);
        
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new IllegalArgumentException("Permission not found: " + permissionId));
        
        permission.setName(name);
        permission.setDescription(description);
        permission.setUpdatedAt(java.time.LocalDateTime.now());
        
        return permissionRepository.save(permission);
    }
    
    public void deletePermission(Long permissionId) {
        log.info("Deleting permission: {}", permissionId);
        
        if (!permissionRepository.findById(permissionId).isPresent()) {
            throw new IllegalArgumentException("Permission not found: " + permissionId);
        }
        
        // Remove all role-permission mappings first
        rolePermissionRepository.deleteByPermissionId(permissionId);
        
        // Delete the permission
        permissionRepository.deleteById(permissionId);
    }
    
    // ========== ROLE MANAGEMENT ==========
    
    public Role createRole(String name, String description) {
        log.info("Creating role: {}", name);
        
        if (roleRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("Role with name " + name + " already exists");
        }
        
        Role role = new Role();
        role.setName(name);
        role.setDescription(description);
        role.setCreatedAt(java.time.LocalDateTime.now());
        role.setUpdatedAt(java.time.LocalDateTime.now());
        
        return roleRepository.save(role);
    }
    
    @Transactional(readOnly = true)
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Role getRoleByName(String name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + name));
    }
    
    public Role updateRole(Long roleId, String name, String description) {
        log.info("Updating role: {}", roleId);
        
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleId));
        
        role.setName(name);
        role.setDescription(description);
        role.setUpdatedAt(java.time.LocalDateTime.now());
        
        return roleRepository.save(role);
    }
    
    public void deleteRole(Long roleId) {
        log.info("Deleting role: {}", roleId);
        
        if (!roleRepository.findById(roleId).isPresent()) {
            throw new IllegalArgumentException("Role not found: " + roleId);
        }
        
        // Remove all role-permission mappings first
        rolePermissionRepository.deleteByRoleId(roleId);
        
        // Delete the role
        roleRepository.deleteById(roleId);
    }
    
    // ========== ROLE-PERMISSION MAPPING ==========
    
    public RolePermission assignPermissionToRole(Long roleId, Long permissionId) {
        log.info("Assigning permission {} to role {}", permissionId, roleId);
        
        if (rolePermissionRepository.existsByRoleIdAndPermissionId(roleId, permissionId)) {
            throw new IllegalArgumentException("Permission already assigned to role");
        }
        
        RolePermission rolePermission = new RolePermission(roleId, permissionId);
        return rolePermissionRepository.save(rolePermission);
    }
    
    public void removePermissionFromRole(Long roleId, Long permissionId) {
        log.info("Removing permission {} from role {}", permissionId, roleId);
        
        rolePermissionRepository.deleteByRoleIdAndPermissionId(roleId, permissionId);
    }
    
    @Transactional(readOnly = true)
    public List<Permission> getPermissionsForRole(Long roleId) {
        List<RolePermission> rolePermissions = rolePermissionRepository.findByRoleId(roleId);
        return rolePermissions.stream()
                .map(rp -> permissionRepository.findById(rp.getPermissionId()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<Permission> getPermissionsForRole(String roleName) {
        Role role = getRoleByName(roleName);
        return getPermissionsForRole(role.getId());
    }
    
    @Transactional(readOnly = true)
    public boolean roleHasPermission(Long roleId, String permissionName) {
        Permission permission = getPermissionByName(permissionName);
        return rolePermissionRepository.existsByRoleIdAndPermissionId(roleId, permission.getId());
    }

    /**
     * Efficiently retrieves roles and their permissions for a user in a single query
     * @param userId The user ID
     * @return Map where key is role name and value is list of permission names
     */
    @Transactional(readOnly = true)
    public Map<String, List<String>> getRolePermissionNameForUser(Integer userId) {
        String sql = "SELECT r.name as role_name, p.name as permission_name " +
                     "FROM user_roles ur " +
                     "JOIN roles r ON ur.role_id = r.id " +
                     "LEFT JOIN role_permissions rp ON r.id = rp.role_id " +
                     "LEFT JOIN permissions p ON rp.permission_id = p.id " +
                     "WHERE ur.user_id = ? " +
                     "ORDER BY r.name, p.name";

        Map<String, List<String>> rolePermissionMap = new LinkedHashMap<>();

        mariadbJdbcTemplate.query(sql, rs -> {
            String roleName = rs.getString("role_name");
            String permissionName = rs.getString("permission_name");

            // Initialize the list for this role if not exists
            rolePermissionMap.putIfAbsent(roleName, new ArrayList<>());

            // Add permission to role's list (if permission is not null)
            if (permissionName != null && !permissionName.isEmpty()) {
                rolePermissionMap.get(roleName).add(permissionName);
            }
        }, userId);

        log.debug("Retrieved roles and permissions for user {}: {}", userId, rolePermissionMap);
        return rolePermissionMap;
    }
    

    // ========== USER-ROLE MAPPING ==========
    
    public void assignRoleToUser(Integer userId, Long roleId) {
        log.info("Assigning role {} to user {}", roleId, userId);
        String sql = "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)";
        mariadbJdbcTemplate.update(sql, userId, roleId);
    }
    
    public void assignRoleToUser(Integer userId, RoleName roleName) {
        Role role = getRoleByName(roleName.getValue());
        assignRoleToUser(userId, role.getId());
    }
    
    public void removeRoleFromUser(Integer userId, Long roleId) {
        log.info("Removing role {} from user {}", roleId, userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleId));
        
        // Remove role from user's roles and save
        user.getRoles().remove(role);
//        userRepository.save(user);
    }
    
    public void removeRoleFromUser(Integer userId, String roleName) {
        Role role = getRoleByName(roleName);
        removeRoleFromUser(userId, role.getId());
    }
    
    @Transactional(readOnly = true)
    public List<Role> getRolesForUser(Integer userId) {
        // Check if user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        
        // Load roles from database
        Set<Role> roles =  userRepository.loadUserRoles(userId);
        return new ArrayList<>(roles);
    }
    
    @Transactional(readOnly = true)
    public List<Role> getRolesForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
        
        // Load roles from database
        Set<Role> roles =  userRepository.loadUserRoles(user.getId());
        return new ArrayList<>(roles);
    }
    
    @Transactional(readOnly = true)
    public boolean userHasRole(Integer userId, String roleName) {
        List<Role> userRoles = getRolesForUser(userId);
        return userRoles.stream().anyMatch(role -> role.getName().equals(roleName));
    }
    
    @Transactional(readOnly = true)
    public boolean userHasRole(String email, String roleName) {
        List<Role> userRoles = getRolesForUser(email);
        return userRoles.stream().anyMatch(role -> role.getName().equals(roleName));
    }
    
    // ========== ACCESS CONTROL ==========
    
    @Transactional(readOnly = true)
    public boolean userHasPermission(Integer userId, String permissionName) {
        List<Role> userRoles = getRolesForUser(userId);
        
        for (Role role : userRoles) {
            if (roleHasPermission(role.getId(), permissionName)) {
                return true;
            }
        }
        
        return false;
    }
    
    @Transactional(readOnly = true)
    public boolean userHasPermission(String email, String permissionName) {
        List<Role> userRoles = getRolesForUser(email);
        
        for (Role role : userRoles) {
            if (roleHasPermission(role.getId(), permissionName)) {
                return true;
            }
        }
        
        return false;
    }
    
    @Transactional(readOnly = true)
    public boolean userHasPermission(Integer userId, String resourceType, String action) {
        String permissionName = Permission.createPermissionName(resourceType, action);
        return userHasPermission(userId, permissionName);
    }
    
    @Transactional(readOnly = true)
    public boolean userHasPermission(String email, String resourceType, String action) {
        String permissionName = Permission.createPermissionName(resourceType, action);
        return userHasPermission(email, permissionName);
    }
    
    @Transactional(readOnly = true)
    public List<Permission> getPermissionsForUser(Integer userId) {
        List<Role> userRoles = getRolesForUser(userId);
        List<Permission> allPermissions = new ArrayList<>();
        
        for (Role role : userRoles) {
            allPermissions.addAll(getPermissionsForRole(role.getId()));
        }
        
        // Remove duplicates
        return allPermissions.stream()
                .distinct()
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<Permission> getPermissionsForUser(String email) {
        List<Role> userRoles = getRolesForUser(email);
        List<Permission> allPermissions = new ArrayList<>();
        
        for (Role role : userRoles) {
            allPermissions.addAll(getPermissionsForRole(role.getId()));
        }
        
        // Remove duplicates
        return allPermissions.stream()
                .distinct()
                .collect(Collectors.toList());
    }

    
    // ========== UTILITY METHODS ==========
    
    public void initializeDefaultRolesAndPermissions() {
        log.info("Initializing default roles and permissions");
        
        // Create default permissions
        createDefaultPermissions();
        
        // Create default roles
        createDefaultRoles();
        
        // Assign permissions to roles
        assignDefaultPermissionsToRoles();
    }
    
    private void createDefaultPermissions() {
        // User permissions
        createPermission("USER_CREATE", "Create users", "USER", "CREATE");
        createPermission("USER_READ", "Read user information", "USER", "READ");
        createPermission("USER_UPDATE", "Update user information", "USER", "UPDATE");
        createPermission("USER_DELETE", "Delete users", "USER", "DELETE");
        
        // Lesson permissions
        createPermission("LESSON_CREATE", "Create lessons", "LESSON", "CREATE");
        createPermission("LESSON_READ", "Read lessons", "LESSON", "READ");
        createPermission("LESSON_UPDATE", "Update lessons", "LESSON", "UPDATE");
        createPermission("LESSON_DELETE", "Delete lessons", "LESSON", "DELETE");
        
        // Quiz permissions
        createPermission("QUIZ_CREATE", "Create quizzes", "QUIZ", "CREATE");
        createPermission("QUIZ_READ", "Read quizzes", "QUIZ", "READ");
        createPermission("QUIZ_UPDATE", "Update quizzes", "QUIZ", "UPDATE");
        createPermission("QUIZ_DELETE", "Delete quizzes", "QUIZ", "DELETE");
        
        // Progress permissions
        createPermission("PROGRESS_READ", "Read progress", "PROGRESS", "READ");
        createPermission("PROGRESS_UPDATE", "Update progress", "PROGRESS", "UPDATE");
        
        // Admin permissions
        createPermission("ADMIN_ALL", "Full admin access", "ADMIN", "ALL");
    }
    
    private void createDefaultRoles() {
        createRole("ADMIN", "System Administrator");
        createRole("TEACHER", "Teacher/Instructor");
        createRole("STUDENT", "Student/Learner");
    }
    
    private void assignDefaultPermissionsToRoles() {
        // Admin gets all permissions
        Role adminRole = getRoleByName("ADMIN");
        List<Permission> allPermissions = getAllPermissions();
        for (Permission permission : allPermissions) {
            try {
                assignPermissionToRole(adminRole.getId(), permission.getId());
            } catch (IllegalArgumentException e) {
                // Already assigned
            }
        }
        
        // Teacher permissions
        Role teacherRole = getRoleByName("TEACHER");
        List<String> teacherPermissions = List.of(
            "USER_READ", "LESSON_CREATE", "LESSON_READ", "LESSON_UPDATE", "LESSON_DELETE",
            "QUIZ_CREATE", "QUIZ_READ", "QUIZ_UPDATE", "QUIZ_DELETE", "PROGRESS_READ"
        );
        
        for (String permissionName : teacherPermissions) {
            try {
                Permission permission = getPermissionByName(permissionName);
                assignPermissionToRole(teacherRole.getId(), permission.getId());
            } catch (IllegalArgumentException e) {
                log.warn("Permission {} not found", permissionName);
            }
        }
        
        // Student permissions
        Role studentRole = getRoleByName("STUDENT");
        List<String> studentPermissions = List.of(
            "USER_READ", "LESSON_READ", "QUIZ_READ", "PROGRESS_READ", "PROGRESS_UPDATE"
        );
        
        for (String permissionName : studentPermissions) {
            try {
                Permission permission = getPermissionByName(permissionName);
                assignPermissionToRole(studentRole.getId(), permission.getId());
            } catch (IllegalArgumentException e) {
                log.warn("Permission {} not found", permissionName);
            }
        }
    }
    

    @Transactional(readOnly = true)
    public boolean isAdmin(Integer userId) {
        return userHasRole(userId, "ADMIN");
    }
    

    @Transactional(readOnly = true)
    public boolean isAdmin(String email) {
        return userHasRole(email, "ADMIN");
    }
    

    @Transactional(readOnly = true)
    public boolean isTeacher(Integer userId) {
        return userHasRole(userId, "TEACHER");
    }
    

    @Transactional(readOnly = true)
    public boolean isTeacher(String email) {
        return userHasRole(email, "TEACHER");
    }
    

    @Transactional(readOnly = true)
    public boolean isStudent(Integer userId) {
        return userHasRole(userId, "STUDENT");
    }
    

    @Transactional(readOnly = true)
    public boolean isStudent(String email) {
        return userHasRole(email, "STUDENT");
    }
}
