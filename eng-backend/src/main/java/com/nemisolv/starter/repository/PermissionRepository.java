package com.nemisolv.starter.repository;

import com.nemisolv.starter.entity.Permission;
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
 * JDBC implementation of PermissionRepository
 */
@Repository
@Slf4j
@RequiredArgsConstructor
public class PermissionRepository {
    
    @Qualifier("mariadbJdbcTemplate")
    private final JdbcTemplate mariadbJdbcTemplate;
    
    @Qualifier("namedParameterJdbcTemplate")
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    

    public Permission save(Permission permission) {
        if (permission.getId() == null) {
            // Insert new permission
            String sql = "INSERT INTO permissions (name, display_name, resource_type, action, created_at) " +
                        "VALUES (:name, :displayName, :resourceType, :action, :createdAt)";
            
            Map<String, Object> params = new HashMap<>();
            params.put("name", permission.getName());
            params.put("displayName", permission.getDescription());
            params.put("resourceType", permission.getResourceType());
            params.put("action", permission.getAction());
            params.put("createdAt", LocalDateTime.now());
            
            try {
                KeyHolder keyHolder = new GeneratedKeyHolder();
                namedParameterJdbcTemplate.update(sql, new MapSqlParameterSource(params), keyHolder);
                
                Number generatedId = keyHolder.getKey();
                if (generatedId != null) {
                    permission.setId(generatedId.longValue());
                }
                permission.setCreatedAt(LocalDateTime.now());
                
                log.debug("Saved permission: {} with ID: {}", permission.getName(), permission.getId());
                return permission;
            } catch (Exception e) {
                log.error("Error saving permission: {}", e.getMessage());
                throw new RuntimeException("Failed to save permission", e);
            }
        } else {
            // Update existing permission
            String sql = "UPDATE permissions SET name = :name, display_name = :displayName, " +
                        "resource_type = :resourceType, action = :action WHERE id = :id";
            
            Map<String, Object> params = new HashMap<>();
            params.put("id", permission.getId());
            params.put("name", permission.getName());
            params.put("displayName", permission.getDescription());
            params.put("resourceType", permission.getResourceType());
            params.put("action", permission.getAction());
            
            try {
                namedParameterJdbcTemplate.update(sql, params);
                log.debug("Updated permission: {} with ID: {}", permission.getName(), permission.getId());
                return permission;
            } catch (Exception e) {
                log.error("Error updating permission: {}", e.getMessage());
                throw new RuntimeException("Failed to update permission", e);
            }
        }
    }
    

    public Optional<Permission> findById(Long id) {
        String sql = "SELECT * FROM permissions WHERE id = ?";
        try {
            List<Permission> permissions = mariadbJdbcTemplate.query(sql, this::mapRowToPermission, id);
            return permissions.stream().findFirst();
        } catch (Exception e) {
            log.error("Error finding permission by ID {}: {}", id, e.getMessage());
            return Optional.empty();
        }
    }
    

    public Optional<Permission> findByName(String name) {
        String sql = "SELECT * FROM permissions WHERE name = ?";
        try {
            List<Permission> permissions = mariadbJdbcTemplate.query(sql, this::mapRowToPermission, name);
            return permissions.stream().findFirst();
        } catch (Exception e) {
            log.error("Error finding permission by name {}: {}", name, e.getMessage());
            return Optional.empty();
        }
    }
    

    public List<Permission> findByResource(String resource) {
        String sql = "SELECT * FROM permissions WHERE resource_type = ?";
        try {
            return mariadbJdbcTemplate.query(sql, this::mapRowToPermission, resource);
        } catch (Exception e) {
            log.error("Error finding permissions by resource {}: {}", resource, e.getMessage());
            return new ArrayList<>();
        }
    }
    

    public List<Permission> findAll() {
        String sql = "SELECT * FROM permissions ORDER BY name";
        try {
            return mariadbJdbcTemplate.query(sql, this::mapRowToPermission);
        } catch (Exception e) {
            log.error("Error finding all permissions: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
    

    public void deleteById(Long id) {
        String sql = "DELETE FROM permissions WHERE id = ?";
        try {
            int rowsAffected = mariadbJdbcTemplate.update(sql, id);
            if (rowsAffected > 0) {
                log.debug("Deleted permission with ID: {}", id);
            } else {
                log.warn("No permission found with ID: {}", id);
            }
        } catch (Exception e) {
            log.error("Error deleting permission with ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to delete permission", e);
        }
    }
    

    public boolean existsByName(String name) {
        String sql = "SELECT COUNT(*) FROM permissions WHERE name = ?";
        try {
            Integer count = mariadbJdbcTemplate.queryForObject(sql, Integer.class, name);
            return count != null && count > 0;
        } catch (Exception e) {
            log.error("Error checking if permission exists by name {}: {}", name, e.getMessage());
            return false;
        }
    }
    

    public List<Permission> findByResourceAndAction(String resource, String action) {
        String sql = "SELECT * FROM permissions WHERE resource_type = ? AND action = ?";
        try {
            return mariadbJdbcTemplate.query(sql, this::mapRowToPermission, resource, action);
        } catch (Exception e) {
            log.error("Error finding permissions by resource {} and action {}: {}", resource, action, e.getMessage());
            return new ArrayList<>();
        }
    }

    public boolean existsById(Long id) {
        String sql = "SELECT COUNT(*) FROM permissions WHERE id = ?";
        try {
            Integer count = mariadbJdbcTemplate.queryForObject(sql, Integer.class, id);
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }

    public List<Permission> findByIdIn(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }
        String sql = "SELECT * FROM permissions WHERE id IN (:ids)";
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("ids", ids);
            return namedParameterJdbcTemplate.query(sql, params, this::mapRowToPermission);
        } catch (Exception e) {
            log.error("Error finding permissions by IDs: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<Permission> findByRoleId(Long roleId) {
        String sql = """
            SELECT p.* FROM permissions p
            INNER JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = ?
            ORDER BY p.name
            """;
        try {
            return mariadbJdbcTemplate.query(sql, this::mapRowToPermission, roleId);
        } catch (Exception e) {
            log.error("Error finding permissions by role ID {}: {}", roleId, e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<Permission> findByResourceType(String resourceType) {
        String sql = "SELECT * FROM permissions WHERE resource_type = ? ORDER BY action";
        try {
            return mariadbJdbcTemplate.query(sql, this::mapRowToPermission, resourceType);
        } catch (Exception e) {
            log.error("Error finding permissions by resource type {}: {}", resourceType, e.getMessage());
            return new ArrayList<>();
        }
    }

    public boolean existsByResourceTypeAndAction(String resourceType, String action) {
        String sql = "SELECT COUNT(*) FROM permissions WHERE resource_type = ? AND action = ?";
        try {
            Integer count = mariadbJdbcTemplate.queryForObject(sql, Integer.class, resourceType, action);
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }

    private Permission mapRowToPermission(ResultSet rs, int rowNum) throws SQLException {
        Permission permission = new Permission();
        permission.setId(rs.getLong("id"));
        permission.setName(rs.getString("name"));
        permission.setDisplayName(rs.getString("display_name"));
        permission.setDescription(rs.getString("display_name"));
        permission.setResourceType(rs.getString("resource_type"));
        permission.setAction(rs.getString("action"));
        permission.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return permission;
    }
}
