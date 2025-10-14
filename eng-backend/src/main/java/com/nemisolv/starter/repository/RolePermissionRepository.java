package com.nemisolv.starter.repository;

import com.nemisolv.starter.entity.RolePermission;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.*;

/**
 * JDBC implementation of RolePermissionRepository
 */
@Repository
@Slf4j
@RequiredArgsConstructor
public class RolePermissionRepository {
    
    @Qualifier("mariadbJdbcTemplate")
    private final JdbcTemplate mariadbJdbcTemplate;
    
    @Qualifier("namedParameterJdbcTemplate")
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    

    public RolePermission save(RolePermission rolePermission) {
        // Insert new role-permission mapping
        String sql = "INSERT INTO role_permissions (role_id, permission_id, created_at) " +
                    "VALUES (:roleId, :permissionId, :createdAt)";
        
        Map<String, Object> params = new HashMap<>();
        params.put("roleId", rolePermission.getRoleId());
        params.put("permissionId", rolePermission.getPermissionId());
        params.put("createdAt", LocalDateTime.now());
        
        try {
            KeyHolder keyHolder = new GeneratedKeyHolder();
            namedParameterJdbcTemplate.update(sql, new MapSqlParameterSource(params), keyHolder);
            
            Number generatedId = keyHolder.getKey();
            if (generatedId != null) {
                rolePermission.setId(generatedId.longValue());
            }
            rolePermission.setCreatedAt(LocalDateTime.now());
            
            log.debug("Saved role-permission mapping: roleId={}, permissionId={}", 
                    rolePermission.getRoleId(), rolePermission.getPermissionId());
            return rolePermission;
        } catch (Exception e) {
            log.error("Error saving role-permission mapping: {}", e.getMessage());
            throw new RuntimeException("Failed to save role-permission mapping", e);
        }
    }
    

    public Optional<RolePermission> findById(Long id) {
        String sql = "SELECT * FROM role_permissions WHERE id = ?";
        try {
            List<RolePermission> rolePermissions = mariadbJdbcTemplate.query(sql, this::mapRowToRolePermission, id);
            return rolePermissions.stream().findFirst();
        } catch (Exception e) {
            log.error("Error finding role-permission by ID {}: {}", id, e.getMessage());
            return Optional.empty();
        }
    }
    

    public Optional<RolePermission> findByRoleIdAndPermissionId(Long roleId, Long permissionId) {
        String sql = "SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ?";
        try {
            List<RolePermission> rolePermissions = mariadbJdbcTemplate.query(sql, this::mapRowToRolePermission, roleId, permissionId);
            return rolePermissions.stream().findFirst();
        } catch (Exception e) {
            log.error("Error finding role-permission by roleId {} and permissionId {}: {}", roleId, permissionId, e.getMessage());
            return Optional.empty();
        }
    }
    

    public List<RolePermission> findByRoleId(Long roleId) {
        String sql = "SELECT * FROM role_permissions WHERE role_id = ?";
        try {
            return mariadbJdbcTemplate.query(sql, this::mapRowToRolePermission, roleId);
        } catch (Exception e) {
            log.error("Error finding role-permissions by roleId {}: {}", roleId, e.getMessage());
            return new ArrayList<>();
        }
    }
    

    public List<RolePermission> findByPermissionId(Long permissionId) {
        String sql = "SELECT * FROM role_permissions WHERE permission_id = ?";
        try {
            return mariadbJdbcTemplate.query(sql, this::mapRowToRolePermission, permissionId);
        } catch (Exception e) {
            log.error("Error finding role-permissions by permissionId {}: {}", permissionId, e.getMessage());
            return new ArrayList<>();
        }
    }
    

    public void deleteById(Long id) {
        String sql = "DELETE FROM role_permissions WHERE id = ?";
        try {
            int rowsAffected = mariadbJdbcTemplate.update(sql, id);
            if (rowsAffected > 0) {
                log.debug("Deleted role-permission mapping with ID: {}", id);
            } else {
                log.warn("No role-permission mapping found with ID: {}", id);
            }
        } catch (Exception e) {
            log.error("Error deleting role-permission mapping with ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to delete role-permission mapping", e);
        }
    }
    

    public void deleteByRoleIdAndPermissionId(Long roleId, Long permissionId) {
        String sql = "DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?";
        try {
            int rowsAffected = mariadbJdbcTemplate.update(sql, roleId, permissionId);
            if (rowsAffected > 0) {
                log.debug("Deleted role-permission mapping: roleId={}, permissionId={}", roleId, permissionId);
            } else {
                log.warn("No role-permission mapping found: roleId={}, permissionId={}", roleId, permissionId);
            }
        } catch (Exception e) {
            log.error("Error deleting role-permission mapping: roleId={}, permissionId={}, error: {}", roleId, permissionId, e.getMessage());
            throw new RuntimeException("Failed to delete role-permission mapping", e);
        }
    }
    

    public boolean existsByRoleIdAndPermissionId(Long roleId, Long permissionId) {
        String sql = "SELECT COUNT(*) FROM role_permissions WHERE role_id = ? AND permission_id = ?";
        try {
            Integer count = mariadbJdbcTemplate.queryForObject(sql, Integer.class, roleId, permissionId);
            return count != null && count > 0;
        } catch (Exception e) {
            log.error("Error checking if role-permission mapping exists: roleId={}, permissionId={}, error: {}", roleId, permissionId, e.getMessage());
            return false;
        }
    }
    

    public void deleteByRoleId(Long roleId) {
        String sql = "DELETE FROM role_permissions WHERE role_id = ?";
        try {
            int rowsAffected = mariadbJdbcTemplate.update(sql, roleId);
            log.debug("Deleted {} role-permission mappings for roleId: {}", rowsAffected, roleId);
        } catch (Exception e) {
            log.error("Error deleting role-permission mappings for roleId {}: {}", roleId, e.getMessage());
            throw new RuntimeException("Failed to delete role-permission mappings", e);
        }
    }
    

    public void deleteByPermissionId(Long permissionId) {
        String sql = "DELETE FROM role_permissions WHERE permission_id = ?";
        try {
            int rowsAffected = mariadbJdbcTemplate.update(sql, permissionId);
            log.debug("Deleted {} role-permission mappings for permissionId: {}", rowsAffected, permissionId);
        } catch (Exception e) {
            log.error("Error deleting role-permission mappings for permissionId {}: {}", permissionId, e.getMessage());
            throw new RuntimeException("Failed to delete role-permission mappings", e);
        }
    }

    public void deleteByRoleIdAndPermissionIdIn(Long roleId, Set<Long> permissionIds) {
        if (permissionIds == null || permissionIds.isEmpty()) return;
        String sql = "DELETE FROM role_permissions WHERE role_id = :roleId AND permission_id IN (:permissionIds)";
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("roleId", roleId);
            params.put("permissionIds", permissionIds);
            int rowsAffected = namedParameterJdbcTemplate.update(sql, params);
            log.debug("Deleted {} role-permission mappings", rowsAffected);
        } catch (Exception e) {
            log.error("Error deleting role-permission mappings: {}", e.getMessage());
            throw new RuntimeException("Failed to delete role-permission mappings", e);
        }
    }

    public void insert(Long roleId, Long permissionId) {
        String sql = "INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at) VALUES (?, ?, ?)";
        try {
            mariadbJdbcTemplate.update(sql, roleId, permissionId, LocalDateTime.now());
        } catch (Exception e) {
            log.error("Error inserting role-permission: {}", e.getMessage());
            throw new RuntimeException("Failed to insert role-permission", e);
        }
    }

    public Integer countByRoleId(Long roleId) {
        String sql = "SELECT COUNT(*) FROM role_permissions WHERE role_id = ?";
        try {
            Integer count = mariadbJdbcTemplate.queryForObject(sql, Integer.class, roleId);
            return count != null ? count : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    public Long countByPermissionId(Long permissionId) {
        String sql = "SELECT COUNT(*) FROM role_permissions WHERE permission_id = ?";
        try {
            Long count = mariadbJdbcTemplate.queryForObject(sql, Long.class, permissionId);
            return count != null ? count : 0L;
        } catch (Exception e) {
            return 0L;
        }
    }

    private RolePermission mapRowToRolePermission(ResultSet rs, int rowNum) throws SQLException {
        RolePermission rolePermission = new RolePermission();
        rolePermission.setId(rs.getLong("id"));
        rolePermission.setRoleId(rs.getLong("role_id"));
        rolePermission.setPermissionId(rs.getLong("permission_id"));
        rolePermission.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return rolePermission;
    }
}
