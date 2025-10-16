package com.nemisolv.starter.repository;

import com.nemisolv.starter.entity.Role;
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
 * JDBC implementation of RoleRepository
 */
@Repository
@Slf4j
@RequiredArgsConstructor
public class RoleRepository {
    
    @Qualifier("mariadbJdbcTemplate")
    private final JdbcTemplate mariadbJdbcTemplate;
    
    @Qualifier("namedParameterJdbcTemplate")
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    

    public Role save(Role role) {
        if (role.getId() == null) {
            // Insert new role
            String sql = "INSERT INTO roles (name, display_name, description, created_at) " +
                        "VALUES (:name, :displayName, :description, :createdAt)";
            
            Map<String, Object> params = new HashMap<>();
            params.put("name", role.getName());
            params.put("displayName", role.getName()); // Using name as display_name for now
            params.put("description", role.getDescription());
            params.put("createdAt", LocalDateTime.now());
            
            try {
                KeyHolder keyHolder = new GeneratedKeyHolder();
                namedParameterJdbcTemplate.update(sql, new MapSqlParameterSource(params), keyHolder);
                
                Number generatedId = keyHolder.getKey();
                if (generatedId != null) {
                    role.setId(generatedId.longValue());
                }
                role.setCreatedAt(LocalDateTime.now());
                
                log.debug("Saved role: {} with ID: {}", role.getName(), role.getId());
                return role;
            } catch (Exception e) {
                log.error("Error saving role: {}", e.getMessage());
                throw new RuntimeException("Failed to save role", e);
            }
        } else {
            // Update existing role
            String sql = "UPDATE roles SET name = :name, display_name = :displayName, " +
                        "description = :description WHERE id = :id";
            
            Map<String, Object> params = new HashMap<>();
            params.put("id", role.getId());
            params.put("name", role.getName());
            params.put("displayName", role.getName()); // Using name as display_name for now
            params.put("description", role.getDescription());
            
            try {
                namedParameterJdbcTemplate.update(sql, params);
                log.debug("Updated role: {} with ID: {}", role.getName(), role.getId());
                return role;
            } catch (Exception e) {
                log.error("Error updating role: {}", e.getMessage());
                throw new RuntimeException("Failed to update role", e);
            }
        }
    }
    

    public Optional<Role> findById(Long id) {
        String sql = "SELECT * FROM roles WHERE id = ?";
        try {
            List<Role> roles = mariadbJdbcTemplate.query(sql, this::mapRowToRole, id);
            return roles.stream().findFirst();
        } catch (Exception e) {
            log.error("Error finding role by ID {}: {}", id, e.getMessage());
            return Optional.empty();
        }
    }
    

    public Optional<Role> findByName(String name) {
        String sql = "SELECT * FROM roles WHERE name = ?";
        try {
            List<Role> roles = mariadbJdbcTemplate.query(sql, this::mapRowToRole, name);
            return roles.stream().findFirst();
        } catch (Exception e) {
            log.error("Error finding role by name {}: {}", name, e.getMessage());
            return Optional.empty();
        }
    }
    

    public List<Role> findAll() {
        String sql = "SELECT * FROM roles ORDER BY name";
        try {
            return mariadbJdbcTemplate.query(sql, this::mapRowToRole);
        } catch (Exception e) {
            log.error("Error finding all roles: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
    

    public void deleteById(Long id) {
        String sql = "DELETE FROM roles WHERE id = ?";
        try {
            int rowsAffected = mariadbJdbcTemplate.update(sql, id);
            if (rowsAffected > 0) {
                log.debug("Deleted role with ID: {}", id);
            } else {
                log.warn("No role found with ID: {}", id);
            }
        } catch (Exception e) {
            log.error("Error deleting role with ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to delete role", e);
        }
    }
    

    public boolean existsByName(String name) {
        String sql = "SELECT COUNT(*) FROM roles WHERE name = ?";
        try {
            Integer count = mariadbJdbcTemplate.queryForObject(sql, Integer.class, name);
            return count != null && count > 0;
        } catch (Exception e) {
            log.error("Error checking if role exists by name {}: {}", name, e.getMessage());
            return false;
        }
    }

    public boolean existsById(Long id) {
        String sql = "SELECT COUNT(*) FROM roles WHERE id = ?";
        try {
            Integer count = mariadbJdbcTemplate.queryForObject(sql, Integer.class, id);
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }

    public Set<Role> findByIdIn(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new HashSet<>();
        }
        String sql = "SELECT * FROM roles WHERE id IN (:ids)";
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("ids", ids);
            List<Role> roles = namedParameterJdbcTemplate.query(sql, params, this::mapRowToRole);
            return new HashSet<>(roles);
        } catch (Exception e) {
            log.error("Error finding roles by IDs: {}", e.getMessage());
            return new HashSet<>();
        }
    }

    public Long countUsersByRoleId(Long roleId) {
        String sql = "SELECT COUNT(*) FROM user_roles WHERE role_id = ?";
        try {
            Long count = mariadbJdbcTemplate.queryForObject(sql, Long.class, roleId);
            return count != null ? count : 0L;
        } catch (Exception e) {
            return 0L;
        }
    }

    public com.nemisolv.starter.pagination.Page<Role> findAll(com.nemisolv.starter.pagination.Pageable pageable) {
        String countSql = "SELECT COUNT(*) FROM roles";
        Long total = mariadbJdbcTemplate.queryForObject(countSql, Long.class);
        total = total != null ? total : 0;

        StringBuilder sql = new StringBuilder("SELECT * FROM roles");

        // Add ORDER BY if sort is present
        if (pageable.getSort() != null && pageable.getSort().isSorted()) {
            sql.append(" ORDER BY ").append(pageable.getSort().toSql());
        } else {
            sql.append(" ORDER BY name");
        }

        sql.append(" LIMIT ? OFFSET ?");

        List<Role> roles = mariadbJdbcTemplate.query(sql.toString(), this::mapRowToRole,
                pageable.getPageSize(), pageable.getOffset());

        return com.nemisolv.starter.pagination.Page.of(roles, pageable, total);
    }

    private Role mapRowToRole(ResultSet rs, int rowNum) throws SQLException {
        Role role = new Role();
        role.setId(rs.getLong("id"));
        role.setName(rs.getString("name"));
        role.setDescription(rs.getString("description"));
        role.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return role;
    }
}
