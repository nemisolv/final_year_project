package com.nemisolv.starter.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Role-Permission mapping entity for RBAC system
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RolePermission {
    
    private Long id;
    private Long roleId;
    private Long permissionId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public RolePermission(Long roleId, Long permissionId) {
        this.roleId = roleId;
        this.permissionId = permissionId;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
