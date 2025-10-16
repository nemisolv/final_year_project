package com.nemisolv.starter.repository;

import com.nemisolv.starter.enums.UserStatus;
import com.nemisolv.starter.pagination.Pageable;
import com.nemisolv.starter.payload.admin.AdminUserResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.*;

@Repository
@Slf4j
@RequiredArgsConstructor
public class AdminUserRepository {

    @Qualifier("mariadbJdbcTemplate")
    private final JdbcTemplate mariadbJdbcTemplate;

    @Qualifier("namedParameterJdbcTemplate")
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public List<AdminUserResponse> findAllUsers(Pageable pageable) {
        String sql = """
            SELECT
                u.id,
                u.email,
                u.username,
                u.status,
                u.email_verified,
                u.last_login_at,
                u.created_at,
                u.updated_at,
                up.name as full_name,
                up.is_onboarded,
                GROUP_CONCAT(r.name) as roles
            FROM users u
            LEFT JOIN user_profiles  up ON u.id = up.user_id
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            GROUP BY u.id, u.email, u.username, u.status, u.email_verified,
                     u.last_login_at, u.created_at, u.updated_at, up.name, up.is_onboarded
            ORDER BY %s
            LIMIT ? OFFSET ?
            """.formatted(getSortClause(pageable));

        int offset = pageable.getOffset();

        return mariadbJdbcTemplate.query(
            sql,
            (rs, rowNum) -> {
                try {
                    return AdminUserResponse.fromRs(rs);
                } catch (SQLException e) {
                    log.error("Error mapping user response", e);
                    return null;
                }
            },
            pageable.getPageSize(),
            offset
        );
    }

    public long countAllUsers() {
        String sql = "SELECT COUNT(*) FROM users";
        Long count = mariadbJdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0;
    }

    public Optional<AdminUserResponse> findUserById(Integer id) {
        String sql = """
            SELECT
                u.id,
                u.email,
                u.username,
                u.status,
                u.email_verified,
                u.last_login_at,
                u.created_at,
                u.updated_at,
                up.name as full_name,
                up.is_onboarded,
                GROUP_CONCAT(r.name) as roles
            FROM users u
            LEFT JOIN user_profiles s up ON u.id = up.user_id
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.id = ?
            GROUP BY u.id, u.email, u.username, u.status, u.email_verified,
                     u.last_login_at, u.created_at, u.updated_at, up.name, up.is_onboarded
            """;

        List<AdminUserResponse> results = mariadbJdbcTemplate.query(
            sql,
            (rs, rowNum) -> {
                try {
                    return AdminUserResponse.fromRs(rs);
                } catch (SQLException e) {
                    log.error("Error mapping user response", e);
                    return null;
                }
            },
            id
        );

        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public Integer createUser(String email, String username, String hashedPassword, String fullName, String phoneNumber) {
        // First create the user
        String userSql = """
            INSERT INTO users (email, username, password_hashed, status, provider, email_verified, created_at)
            VALUES (:email, :username, :password, :status, :provider, :emailVerified, :createdAt)
            """;

        Map<String, Object> userParams = new HashMap<>();
        userParams.put("email", email);
        userParams.put("username", username);
        userParams.put("password", hashedPassword);
        userParams.put("status", UserStatus.ACTIVE.getValue());
        userParams.put("provider", "local");
        userParams.put("emailVerified", true);
        userParams.put("createdAt", LocalDateTime.now());

        KeyHolder keyHolder = new GeneratedKeyHolder();
        namedParameterJdbcTemplate.update(userSql, new MapSqlParameterSource(userParams), keyHolder);

        Integer userId = keyHolder.getKey().intValue();

        // Create user profile
        String profileSql = """
            INSERT INTO user_profiles  (user_id, name, phone_number, is_onboarded, created_at)
            VALUES (:userId, :name, :phoneNumber, :isOnboarded, :createdAt)
            """;

        Map<String, Object> profileParams = new HashMap<>();
        profileParams.put("userId", userId);
        profileParams.put("name", fullName);
        profileParams.put("phoneNumber", phoneNumber);
        profileParams.put("isOnboarded", false);
        profileParams.put("createdAt", LocalDateTime.now());

        namedParameterJdbcTemplate.update(profileSql, profileParams);

        return userId;
    }

    public void assignRolesToUser(Integer userId, List<String> roleNames) {
        // First, get role IDs
        String getRoleIdsSql = "SELECT id FROM roles WHERE name IN (:roleNames)";
        Map<String, Object> params = new HashMap<>();
        params.put("roleNames", roleNames);

        List<Long> roleIds = namedParameterJdbcTemplate.queryForList(getRoleIdsSql, params, Long.class);

        // Assign roles to user
        String assignSql = "INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES (:userId, :roleId, :assignedAt)";

        for (Long roleId : roleIds) {
            Map<String, Object> assignParams = new HashMap<>();
            assignParams.put("userId", userId);
            assignParams.put("roleId", roleId);
            assignParams.put("assignedAt", LocalDateTime.now());
            namedParameterJdbcTemplate.update(assignSql, assignParams);
        }
    }

    public void updateUser(Integer userId, String email, String username, String fullName, String phoneNumber) {
        // Update user table
        String userSql = """
            UPDATE users
            SET email = :email, username = :username, updated_at = :updatedAt
            WHERE id = :userId
            """;

        Map<String, Object> userParams = new HashMap<>();
        userParams.put("email", email);
        userParams.put("username", username);
        userParams.put("updatedAt", LocalDateTime.now());
        userParams.put("userId", userId);

        namedParameterJdbcTemplate.update(userSql, userParams);

        // Update user profile
        String profileSql = """
            UPDATE user_profiles 
            SET name = :name, phone_number = :phoneNumber, updated_at = :updatedAt
            WHERE user_id = :userId
            """;

        Map<String, Object> profileParams = new HashMap<>();
        profileParams.put("name", fullName);
        profileParams.put("phoneNumber", phoneNumber);
        profileParams.put("updatedAt", LocalDateTime.now());
        profileParams.put("userId", userId);

        namedParameterJdbcTemplate.update(profileSql, profileParams);
    }

    public void updateUserRoles(Integer userId, List<String> roleNames) {
        // First, remove existing roles
        String deleteSql = "DELETE FROM user_roles WHERE user_id = :userId";
        Map<String, Object> deleteParams = new HashMap<>();
        deleteParams.put("userId", userId);
        namedParameterJdbcTemplate.update(deleteSql, deleteParams);

        // Then assign new roles
        if (!roleNames.isEmpty()) {
            assignRolesToUser(userId, roleNames);
        }
    }

    public void updateUserStatus(Integer userId, UserStatus status) {
        String sql = "UPDATE users SET status = :status, updated_at = :updatedAt WHERE id = :userId";

        Map<String, Object> params = new HashMap<>();
        params.put("status", status.getValue());
        params.put("updatedAt", LocalDateTime.now());
        params.put("userId", userId);

        namedParameterJdbcTemplate.update(sql, params);
    }

    public void deleteUser(Integer userId) {
        // Delete user roles
        String deleteRolesSql = "DELETE FROM user_roles WHERE user_id = :userId";
        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        namedParameterJdbcTemplate.update(deleteRolesSql, params);

        // Delete user profile
        String deleteProfileSql = "DELETE FROM user_profiles  WHERE user_id = :userId";
        namedParameterJdbcTemplate.update(deleteProfileSql, params);

        // Delete user
        String deleteUserSql = "DELETE FROM users WHERE id = :userId";
        namedParameterJdbcTemplate.update(deleteUserSql, params);
    }

    private String getSortClause(Pageable pageable) {
        if (pageable.getSort() != null && pageable.getSort().isSorted()) {
            return pageable.getSort().getOrders().stream()
                .map(order -> {
                    String property = order.getProperty();
                    // Map property names to actual column names
                    String column = switch (property) {
                        case "createdAt" -> "u.created_at";
                        case "email" -> "u.email";
                        case "username" -> "u.username";
                        case "fullName" -> "up.name";
                        default -> "u.created_at";
                    };
                    return column + " " + order.getDirection().name();
                })
                .reduce((a, b) -> a + ", " + b)
                .orElse("u.created_at DESC");
        }
        return "u.created_at DESC";
    }
}
