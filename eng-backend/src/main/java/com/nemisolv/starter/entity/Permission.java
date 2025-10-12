package com.nemisolv.starter.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Permission entity for RBAC system
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Permission {
    
    private Long id;
    private String name; // e.g., "LESSON_CREATE", "USER_DELETE"
    private String description;
    private String resourceType; // e.g., "LESSON", "USER", "QUIZ"
    private String action; // e.g., "CREATE", "READ", "UPDATE", "DELETE"
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public Permission(String name, String description, String resourceType, String action) {
        this.name = name;
        this.description = description;
        this.resourceType = resourceType;
        this.action = action;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Helper method to create permission name
    public static String createPermissionName(String resourceType, String action) {
        return resourceType.toUpperCase() + "_" + action.toUpperCase();
    }
}