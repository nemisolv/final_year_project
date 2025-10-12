package com.nemisolv.starter.repository;

import com.nemisolv.starter.entity.RefreshToken;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@Slf4j
public class RefreshTokenRepository {

    private final JdbcTemplate mariadbJdbcTemplate;

    public RefreshTokenRepository(@Qualifier("mariadbJdbcTemplate") JdbcTemplate mariadbJdbcTemplate) {
        this.mariadbJdbcTemplate = mariadbJdbcTemplate;
    }

    /**
     * Save a new refresh token
     */
    public Long save(RefreshToken token) {
        String sql = """
            INSERT INTO refresh_tokens
            (user_id, token, token_hash, access_token_jti, expires_at, device_info, ip_address, user_agent, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;

        try {
            KeyHolder keyHolder = new GeneratedKeyHolder();
            mariadbJdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                ps.setLong(1, token.getUserId());
                ps.setString(2, token.getToken());
                ps.setString(3, token.getTokenHash());
                ps.setString(4, token.getAccessTokenJti());
                ps.setTimestamp(5, Timestamp.valueOf(token.getExpiresAt()));
                ps.setString(6, token.getDeviceInfo());
                ps.setString(7, token.getIpAddress());
                ps.setString(8, token.getUserAgent());
                ps.setTimestamp(9, Timestamp.valueOf(token.getCreatedAt()));
                return ps;
            }, keyHolder);

            Number key = keyHolder.getKey();
            if (key != null) {
                log.debug("Refresh token saved with ID: {}", key.longValue());
                return key.longValue();
            }
            return null;
        } catch (BadSqlGrammarException e) {
            log.error("Failed to save refresh token: {}", e.getMessage());
            throw new RuntimeException("Failed to save refresh token", e);
        }
    }

    /**
     * Find refresh token by token hash
     */
    public Optional<RefreshToken> findByTokenHash(String tokenHash) {
        String sql = "SELECT * FROM refresh_tokens WHERE token_hash = ? LIMIT 1";
        try {
            List<RefreshToken> tokens = mariadbJdbcTemplate.query(
                    sql,
                    (rs, rowNum) -> RefreshToken.fromRs(rs),
                    tokenHash
            );
            return tokens.stream().findFirst();
        } catch (BadSqlGrammarException e) {
            log.error("Failed to find refresh token: {}", e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Find all active (non-revoked, non-expired) tokens for a user
     */
    public List<RefreshToken> findActiveTokensByUserId(Long userId) {
        String sql = """
            SELECT * FROM refresh_tokens
            WHERE user_id = ?
              AND revoked = FALSE
              AND expires_at > NOW()
            ORDER BY created_at DESC
            """;
        try {
            return mariadbJdbcTemplate.query(
                    sql,
                    (rs, rowNum) -> RefreshToken.fromRs(rs),
                    userId
            );
        } catch (BadSqlGrammarException e) {
            log.error("Failed to find active tokens for user {}: {}", userId, e.getMessage());
            return List.of();
        }
    }

    /**
     * Revoke a specific token
     */
    public void revokeToken(String tokenHash) {
        String sql = """
            UPDATE refresh_tokens
            SET revoked = TRUE, revoked_at = NOW()
            WHERE token_hash = ?
            """;
        try {
            int updated = mariadbJdbcTemplate.update(sql, tokenHash);
            if (updated > 0) {
                log.info("Revoked refresh token: {}", tokenHash);
            }
        } catch (BadSqlGrammarException e) {
            log.error("Failed to revoke token: {}", e.getMessage());
        }
    }

    /**
     * Revoke all tokens for a user (logout from all devices)
     */
    public int revokeAllTokensForUser(Long userId) {
        String sql = """
            UPDATE refresh_tokens
            SET revoked = TRUE, revoked_at = NOW()
            WHERE user_id = ? AND revoked = FALSE
            """;
        try {
            int updated = mariadbJdbcTemplate.update(sql, userId);
            log.info("Revoked {} tokens for user {}", updated, userId);
            return updated;
        } catch (BadSqlGrammarException e) {
            log.error("Failed to revoke all tokens for user {}: {}", userId, e.getMessage());
            return 0;
        }
    }

    /**
     * Mark token as replaced (for token rotation)
     */
    public void markAsReplaced(String oldTokenHash, Long newTokenId) {
        String sql = """
            UPDATE refresh_tokens
            SET revoked = TRUE, revoked_at = NOW(), replaced_by = ?
            WHERE token_hash = ?
            """;
        try {
            mariadbJdbcTemplate.update(sql, newTokenId, oldTokenHash);
            log.debug("Marked token as replaced: {} -> {}", oldTokenHash, newTokenId);
        } catch (BadSqlGrammarException e) {
            log.error("Failed to mark token as replaced: {}", e.getMessage());
        }
    }

    /**
     * Update last used timestamp
     */
    public void updateLastUsed(String tokenHash) {
        String sql = """
            UPDATE refresh_tokens
            SET last_used_at = NOW()
            WHERE token_hash = ?
            """;
        try {
            mariadbJdbcTemplate.update(sql, tokenHash);
        } catch (BadSqlGrammarException e) {
            log.error("Failed to update last used timestamp: {}", e.getMessage());
        }
    }

    /**
     * Atomically mark token as used (revoked) if it's not already revoked
     * Returns number of rows updated (0 if already revoked, 1 if successfully marked as used)
     * This prevents race conditions where the same refresh token is used multiple times
     */
    public int markAsUsedIfNotRevoked(String tokenHash) {
        String sql = """
            UPDATE refresh_tokens
            SET revoked = TRUE, revoked_at = NOW()
            WHERE token_hash = ? AND revoked = FALSE AND expires_at > NOW()
            """;
        try {
            int updated = mariadbJdbcTemplate.update(sql, tokenHash);
            if (updated > 0) {
                log.debug("Atomically marked token as used: {}", tokenHash);
            }
            return updated;
        } catch (BadSqlGrammarException e) {
            log.error("Failed to mark token as used: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * Delete expired tokens (cleanup job)
     */
    public int deleteExpiredTokens() {
        String sql = """
            DELETE FROM refresh_tokens
            WHERE expires_at < NOW() OR (revoked = TRUE AND revoked_at < DATE_SUB(NOW(), INTERVAL 30 DAY))
            """;
        try {
            int deleted = mariadbJdbcTemplate.update(sql);
            if (deleted > 0) {
                log.info("Deleted {} expired/old tokens", deleted);
            }
            return deleted;
        } catch (BadSqlGrammarException e) {
            log.error("Failed to delete expired tokens: {}", e.getMessage());
            return 0;
        }
    }


    /**
     * Revoke token family (all tokens in the rotation chain)
     */
    public void revokeTokenFamily(String tokenHash) {
        // First find the original token in the chain
        String findOriginalSql = """
            WITH RECURSIVE token_chain AS (
                -- Start with the current token
                SELECT id, user_id, token_hash, replaced_by
                FROM refresh_tokens
                WHERE token_hash = ?

                UNION ALL

                -- Find tokens that replaced this one
                SELECT rt.id, rt.user_id, rt.token_hash, rt.replaced_by
                FROM refresh_tokens rt
                INNER JOIN token_chain tc ON rt.id = tc.replaced_by
            )
            SELECT user_id FROM token_chain LIMIT 1
            """;

        try {
            Long userId = mariadbJdbcTemplate.queryForObject(findOriginalSql, Long.class, tokenHash);
            if (userId != null) {
                revokeAllTokensForUser(userId);
                log.warn("Revoked entire token family for user {} due to token reuse detected", userId);
            }
        } catch (Exception e) {
            log.error("Failed to revoke token family: {}", e.getMessage());
            // Fallback: just revoke the specific token
            revokeToken(tokenHash);
        }
    }

    /**
     * Get count of active sessions for a user
     */
    public int getActiveSessionCount(Long userId) {
        String sql = """
            SELECT COUNT(*) FROM refresh_tokens
            WHERE user_id = ? AND revoked = FALSE AND expires_at > NOW()
            """;
        try {
            Integer count = mariadbJdbcTemplate.queryForObject(sql, Integer.class, userId);
            return count != null ? count : 0;
        } catch (Exception e) {
            log.error("Failed to get active session count: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * Find refresh token by access token JTI
     */
    public Optional<RefreshToken> findByAccessTokenJti(String accessTokenJti) {
        String sql = "SELECT * FROM refresh_tokens WHERE access_token_jti = ? LIMIT 1";
        try {
            List<RefreshToken> tokens = mariadbJdbcTemplate.query(
                    sql,
                    (rs, rowNum) -> RefreshToken.fromRs(rs),
                    accessTokenJti
            );
            return tokens.stream().findFirst();
        } catch (BadSqlGrammarException e) {
            log.error("Failed to find refresh token by access token JTI: {}", e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Revoke refresh token by access token JTI
     */
    public void revokeByAccessTokenJti(String accessTokenJti) {
        String sql = """
            UPDATE refresh_tokens
            SET revoked = TRUE, revoked_at = NOW()
            WHERE access_token_jti = ?
            """;
        try {
            int updated = mariadbJdbcTemplate.update(sql, accessTokenJti);
            if (updated > 0) {
                log.info("Revoked refresh token by access token JTI: {}", accessTokenJti);
            }
        } catch (BadSqlGrammarException e) {
            log.error("Failed to revoke token by access token JTI: {}", e.getMessage());
        }
    }
}
