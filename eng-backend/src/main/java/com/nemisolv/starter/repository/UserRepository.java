package com.nemisolv.starter.repository;

import com.nemisolv.starter.entity.User;
import com.nemisolv.starter.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.BadSqlGrammarException;
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
@Repository
@Slf4j
@RequiredArgsConstructor
public class UserRepository {

    @Qualifier("mariadbJdbcTemplate")
    private final JdbcTemplate mariadbJdbcTemplate;
    @Qualifier("namedParameterJdbcTemplate")
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;


    public Optional<User> findByEmail(String email) {
       return findUser("email", email);
    }


    public Optional<User> findByUsername(String username) {
       return findUser("username", username);
    }


    public Integer signUpNormalUser(User user) {
        String sql = "INSERT INTO users(username, email, status, provider, password_hashed, " +
                "email_verified,  created_at, updated_at) VALUES (:username, :email, :status, :provider, :password_hashed, :email_verified, :created_at, :updated_at)";
        Map<String, Object> params = new HashMap<>();
        params.put("username", user.getUsername());
        params.put("email", user.getEmail());
        params.put("status", user.getStatus().getValue());
        params.put("provider", user.getAuthProvider().getValue());
        params.put("password_hashed", user.getHashedPassword());
        params.put("email_verified", user.isEmailVerified());
        params.put("created_at", LocalDateTime.now());
        params.put("updated_at", null);

        try {
            // Use KeyHolder to get the generated ID
            KeyHolder keyHolder = new GeneratedKeyHolder();
            namedParameterJdbcTemplate.update(sql, new MapSqlParameterSource(params), keyHolder);
            
            // Get the generated ID
            Number generatedId = keyHolder.getKey();
            if (generatedId != null) {
                return generatedId.intValue();
            }
            return null;
        } catch (BadSqlGrammarException e) {
            log.error("Bad SQL statement", e);
            return null;
        }
    }




    public Optional<User> findById(Integer id) {
        try {
            String queryUser = "SELECT * FROM users WHERE id = ? AND status = ? LIMIT 1 ";
            List<User> userList = mariadbJdbcTemplate.query(queryUser, ((rs, rowNum) -> User.fromRs(rs)), id, UserStatus.ACTIVE.getValue());
            return userList.stream().findFirst();
        }catch (BadSqlGrammarException e) {
            log.error("Bad SQL statement", e);
            return Optional.empty();
        }
    }



    public void markEmailVerified(String email) {
        String sql = "UPDATE users SET email_verified = 1 WHERE email = ?";
        try {
            mariadbJdbcTemplate.update(sql, email);
        } catch (BadSqlGrammarException e) {
            log.error("Bad SQL statement", e);
        }
    }


    public void updateLastLoginAtForEmail(Integer userId) {
        String sql = "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = :userId";
        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        try {
            namedParameterJdbcTemplate.update(sql, params);
        } catch (BadSqlGrammarException e) {
            log.error("Bad SQL statement", e);
        }
    }


    /**
     * Save user roles to user_roles table
     */
    public void saveUserRoles(Integer userId, Set<com.nemisolv.starter.entity.Role> roles) {
        // First, remove existing roles
        String deleteSql = "DELETE FROM user_roles WHERE user_id = ?";
        try {
            mariadbJdbcTemplate.update(deleteSql, userId);

            // Then, insert new roles
            String insertSql = "INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES (?, ?, ?)";
            for (com.nemisolv.starter.entity.Role role : roles) {
                mariadbJdbcTemplate.update(insertSql, userId, role.getId(), LocalDateTime.now());
            }

            log.debug("Saved {} roles for user {}", roles.size(), userId);
        } catch (Exception e) {
            log.error("Error saving user roles for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to save user roles", e);
        }
    }
    
    /**
     * Load user roles from user_roles table
     */
    public Set<com.nemisolv.starter.entity.Role> loadUserRoles(Integer userId) {
        String sql = "SELECT r.* FROM roles r " +
                    "INNER JOIN user_roles ur ON r.id = ur.role_id " +
                    "WHERE ur.user_id = ?";
        try {
            List<com.nemisolv.starter.entity.Role> roles = mariadbJdbcTemplate.query(sql, this::mapRowToRole, userId);
            return new HashSet<>(roles);
        } catch (Exception e) {
            log.error("Error loading user roles for user {}: {}", userId, e.getMessage());
            return new HashSet<>();
        }
    }
    
    /**
     * Map ResultSet row to Role object
     */
    private com.nemisolv.starter.entity.Role mapRowToRole(ResultSet rs, int rowNum) throws SQLException {
        com.nemisolv.starter.entity.Role role = new com.nemisolv.starter.entity.Role();
        role.setId(rs.getLong("id"));
        role.setName(rs.getString("name"));
        role.setDescription(rs.getString("description"));
        role.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return role;
    }



    public void updatePassword(Integer id, String hashedPassword) {
        String sql = "UPDATE users SET password_hashed = ?, updated_at = ? WHERE id = ?";
        mariadbJdbcTemplate.update(sql, hashedPassword, LocalDateTime.now(), id);
    }

    public boolean existsByUsername(String username) {
        String sql = "SELECT COUNT(*) FROM users WHERE username = ?";
        Integer count = mariadbJdbcTemplate.queryForObject(sql, Integer.class, username);
        return count != null && count > 0;
    }

    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE email = ?";
        Integer count = mariadbJdbcTemplate.queryForObject(sql, Integer.class, email);
        return count != null && count > 0;
    }

    public boolean existsById(Integer id) {
        String sql = "SELECT COUNT(*) FROM users WHERE id = ?";
        Integer count = mariadbJdbcTemplate.queryForObject(sql, Integer.class, id);
        return count != null && count > 0;
    }

    public User save(User user) {
        if (user.getId() == null) {
            // Insert new user
            Integer id = signUpNormalUser(user);
            user.setId(id);
        } else {
            // Update existing user
            String sql = """
                UPDATE users SET username = ?, email = ?, status = ?,
                       provider = ?, password_hashed = ?, email_verified = ?, updated_at = ?
                WHERE id = ?
                """;
            mariadbJdbcTemplate.update(sql,
                user.getUsername(),
                user.getEmail(),
                user.getStatus().getValue(),
                user.getAuthProvider().getValue(),
                user.getHashedPassword(),
                user.isEmailVerified(),
                LocalDateTime.now(),
                user.getId()
            );
        }
        return user;
    }

    public void deleteById(Integer id) {
        String sql = "DELETE FROM users WHERE id = ?";
        mariadbJdbcTemplate.update(sql, id);
    }

    public com.nemisolv.starter.pagination.Page<User> findAll(com.nemisolv.starter.pagination.Pageable pageable) {
        String countSql = "SELECT COUNT(*) FROM users WHERE status = ?";
        Long total = mariadbJdbcTemplate.queryForObject(countSql, Long.class, UserStatus.ACTIVE.getValue());
        total = total != null ? total : 0;

        StringBuilder sql = new StringBuilder("SELECT * FROM users WHERE status = ?");

        // Add ORDER BY if sort is present
        if (pageable.getSort() != null && pageable.getSort().isSorted()) {
            sql.append(" ORDER BY ").append(pageable.getSort().toSql());
        } else {
            sql.append(" ORDER BY created_at DESC");
        }

        sql.append(" LIMIT ? OFFSET ?");

        List<User> users = mariadbJdbcTemplate.query(sql.toString(),
            (rs, rowNum) -> User.fromRs(rs),
            UserStatus.ACTIVE.getValue(),
            pageable.getPageSize(),
            pageable.getOffset()
        );

        return com.nemisolv.starter.pagination.Page.of(users, pageable, total);
    }

    private Optional<User> findUser( Object identifier, String value ) {
        try {
            String queryUser = "SELECT * FROM users WHERE " + identifier + " = ? AND status = ? LIMIT 1 " ;
            List<User> userList = mariadbJdbcTemplate.query(queryUser, ((rs, rowNum) -> User.fromRs(rs)), value,UserStatus.ACTIVE.getValue());
            return userList.stream().findFirst();
        }catch (BadSqlGrammarException e) {
            log.error("Bad SQL statement", e);
            return Optional.empty();
        }
    }
}
