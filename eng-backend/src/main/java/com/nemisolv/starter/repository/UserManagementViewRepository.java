package com.nemisolv.starter.repository;

import com.nemisolv.starter.pagination.Page;
import com.nemisolv.starter.pagination.Pageable;
import com.nemisolv.starter.payload.admin.AdminUserResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * Repository for user management using optimized database view
 * Uses Redis cache to minimize database hits
 */
@Repository
@Slf4j
@RequiredArgsConstructor
public class UserManagementViewRepository {

    @Qualifier("mariadbJdbcTemplate")
    private final JdbcTemplate jdbcTemplate;

    /**
     * Find all users with pagination
     * Note: Cache disabled due to complex generic type serialization issues
     */
    // @Cacheable(value = "userManagementList", key = "#pageable.page + '-' + #pageable.size + '-' + (#pageable.sort != null ? #pageable.sort.toSql() : 'default')")
    public Page<AdminUserResponse> findAll(Pageable pageable) {
        // Count total - this is also cached
        long total = countAll();

        // Build SQL with sorting
        StringBuilder sql = new StringBuilder(
            "SELECT * FROM v_user_management"
        );

        // Add WHERE clause if needed (for filtering by status, etc.)
        sql.append(" WHERE status = 'ACTIVE'");

        // Add ORDER BY
        if (pageable.getSort() != null && pageable.getSort().isSorted()) {
            sql.append(" ORDER BY ").append(buildSafeOrderByClause(pageable));
        } else {
            sql.append(" ORDER BY created_at DESC");
        }

        // Add pagination
        sql.append(" LIMIT ? OFFSET ?");

        log.debug("Executing query: {}", sql);

        List<AdminUserResponse> users = jdbcTemplate.query(
            sql.toString(),
            this::mapRowToAdminUserResponse,
            pageable.getPageSize(),
            pageable.getOffset()
        );

        return Page.of(users, pageable, total);
    }

    /**
     * Find user by ID - cached indefinitely until evicted
     */
    @Cacheable(value = "userManagementDetail", key = "#userId")
    public Optional<AdminUserResponse> findById(Integer userId) {
        String sql = """
            SELECT * FROM v_user_management
            WHERE id = ?
            LIMIT 1
            """;

        List<AdminUserResponse> results = jdbcTemplate.query(
            sql,
            this::mapRowToAdminUserResponse,
            userId
        );

        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    /**
     * Count all users
     */
    // @Cacheable(value = "userManagementCount")
    public long countAll() {
        String sql = "SELECT COUNT(*) FROM v_user_management WHERE status = 'ACTIVE'";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0L;
    }

    /**
     * Search users by keyword
     */
    // @Cacheable(value = "userManagementSearch", key = "#keyword + '-' + #pageable.page + '-' + #pageable.size")
    public Page<AdminUserResponse> searchUsers(String keyword, Pageable pageable) {
        // Count matching records
        String countSql = """
            SELECT COUNT(*) FROM v_user_management
            WHERE status = 'ACTIVE'
            AND (
                email LIKE ? OR
                username LIKE ? OR
                full_name LIKE ? OR
                roles LIKE ?
            )
            """;

        String searchPattern = "%" + keyword + "%";
        Long total = jdbcTemplate.queryForObject(countSql, Long.class,
            searchPattern, searchPattern, searchPattern, searchPattern);
        total = total != null ? total : 0;

        // Build search query
        StringBuilder sql = new StringBuilder("""
            SELECT * FROM v_user_management
            WHERE status = 'ACTIVE'
            AND (
                email LIKE ? OR
                username LIKE ? OR
                full_name LIKE ? OR
                roles LIKE ?
            )
            """);

        // Add ORDER BY
        if (pageable.getSort() != null && pageable.getSort().isSorted()) {
            sql.append(" ORDER BY ").append(buildSafeOrderByClause(pageable));
        } else {
            sql.append(" ORDER BY created_at DESC");
        }

        sql.append(" LIMIT ? OFFSET ?");

        List<AdminUserResponse> users = jdbcTemplate.query(
            sql.toString(),
            this::mapRowToAdminUserResponse,
            searchPattern, searchPattern, searchPattern, searchPattern,
            pageable.getPageSize(),
            pageable.getOffset()
        );

        return Page.of(users, pageable, total);
    }

    /**
     * Evict user cache when user is updated
     * Call this after any user modification
     */
    @CacheEvict(value = {
        "userManagementList",
        "userManagementDetail",
        "userManagementCount",
        "userManagementSearch"
    }, allEntries = true)
    public void evictUserCache() {
        log.info("Evicted all user management cache");
    }

    /**
     * Evict specific user cache
     */
    @CacheEvict(value = "userManagementDetail", key = "#userId")
    public void evictUserCache(Integer userId) {
        log.info("Evicted cache for user ID: {}", userId);
    }

    /**
     * Map ResultSet to AdminUserResponse using Builder pattern
     */
    private AdminUserResponse mapRowToAdminUserResponse(ResultSet rs, int rowNum) throws SQLException {

        // Roles (comma-separated string to list)
        String rolesStr = rs.getString("roles");
        List<String> roles = rolesStr != null && !rolesStr.isEmpty()
                ? Arrays.asList(rolesStr.split(","))
                : List.of();

        return AdminUserResponse.builder()
                .id(String.valueOf(rs.getInt("id")))
                .email(rs.getString("email"))
                .username(rs.getString("username"))
                .name(rs.getString("name"))
                .roles(roles)
                .emailVerified(rs.getBoolean("email_verified"))
                .status(rs.getString("status"))
                .enabled("ACTIVE".equals(rs.getString("status")))
                .lastLogin(rs.getTimestamp("last_login_at") != null
                    ? rs.getTimestamp("last_login_at").toLocalDateTime()
                    : null)
                .createdAt(rs.getTimestamp("created_at") != null
                    ? rs.getTimestamp("created_at").toLocalDateTime()
                    : null)
                .updatedAt(rs.getTimestamp("updated_at") != null
                    ? rs.getTimestamp("updated_at").toLocalDateTime()
                    : null)
                .isOnboarded(rs.getBoolean("is_onboarded"))
                .build();
    }

    /**
     * Build safe ORDER BY clause from Pageable sort
     * Prevents SQL injection by whitelisting column names
     */
    private String buildSafeOrderByClause(Pageable pageable) {
        if (pageable.getSort() == null || pageable.getSort().isUnsorted()) {
            return "created_at DESC";
        }

        return pageable.getSort().getOrders().stream()
            .map(order -> {
                // Whitelist allowed columns
                String column = switch (order.getProperty()) {
                    case "id" -> "id";
                    case "email" -> "email";
                    case "username" -> "username";
                    case "fullName" -> "full_name";
                    case "createdAt" -> "created_at";
                    case "updatedAt" -> "updated_at";
                    case "lastLoginAt" -> "last_login_at";
                    case "status" -> "status";
                    case "currentLevel" -> "current_level";
                    case "totalXp" -> "total_xp";
                    default -> "created_at"; // Safe default
                };
                return column + " " + order.getDirection().name();
            })
            .reduce((a, b) -> a + ", " + b)
            .orElse("created_at DESC");
    }
}
