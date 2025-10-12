package com.nemisolv.starter.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Role entity for RBAC system
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    
    private Long id;
    private String name; // e.g., "ADMIN", "TEACHER", "STUDENT"
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Many-to-many relationship with User
    private List<Permission> permissions;
    public Role(String name, String description) {
        this.name = name;
        this.description = description;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
}