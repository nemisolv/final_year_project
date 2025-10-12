package com.nemisolv.starter.service;

import com.nemisolv.starter.entity.RefreshToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Token storage service using Redis for high-performance token management
 *
 * Best practices implemented:
 * 1. Access tokens stored in Redis with TTL
 * 2. Refresh tokens stored in both Redis (fast lookup) and DB (persistence)
 * 3. Token blacklist for revoked tokens
 * 4. Session tracking per user
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TokenStorageService {

    private final RedisTemplate<String, Object> redisTemplate;

    // Redis key prefixes
    private static final String ACCESS_TOKEN_PREFIX = "access_token:";
    private static final String REFRESH_TOKEN_PREFIX = "refresh_token:";
    private static final String BLACKLIST_PREFIX = "blacklist:";
    private static final String USER_SESSIONS_PREFIX = "user_sessions:";

    /**
     * Store access token in Redis with TTL
     * @param jti JWT ID (unique identifier from token)
     * @param userId User ID
     * @param expirySeconds Token expiry in seconds
     */
    public void storeAccessToken(String jti, Integer userId, long expirySeconds) {
        String key = ACCESS_TOKEN_PREFIX + jti;
        Map<String, Object> tokenData = Map.of(
                "userId", userId,
                "issuedAt", System.currentTimeMillis(),
                "expiresAt", System.currentTimeMillis() + (expirySeconds * 1000)
        );

        redisTemplate.opsForValue().set(key, tokenData, expirySeconds, TimeUnit.SECONDS);

        // Track this token in user's active sessions
        addToUserSessions(userId, jti, expirySeconds);

        log.debug("Stored access token in Redis: jti={}, userId={}, ttl={}s", jti, userId, expirySeconds);
    }

    /**
     * Store refresh token metadata in Redis
     * @param tokenHash Hashed refresh token
     * @param refreshToken RefreshToken entity
     * @param expirySeconds Token expiry in seconds
     */
    public void storeRefreshToken(String tokenHash, RefreshToken refreshToken, long expirySeconds) {
        String key = REFRESH_TOKEN_PREFIX + tokenHash;
        Map<String, Object> tokenData = Map.of(
                "userId", refreshToken.getUserId(),
                "tokenId", refreshToken.getId(),
                "createdAt", refreshToken.getCreatedAt() != null ? refreshToken.getCreatedAt().toString() : "",
                "expiresAt", refreshToken.getExpiresAt() != null ? refreshToken.getExpiresAt().toString() : ""
        );

        redisTemplate.opsForValue().set(key, tokenData, expirySeconds, TimeUnit.SECONDS);
        log.debug("Stored refresh token in Redis: hash={}, userId={}", tokenHash.substring(0, 10) + "...", refreshToken.getUserId());
    }

    /**
     * Check if access token exists and is valid
     * @param jti JWT ID
     * @return true if token exists in Redis (not revoked/expired)
     */
    public boolean isAccessTokenValid(String jti) {
        String key = ACCESS_TOKEN_PREFIX + jti;
        Boolean exists = redisTemplate.hasKey(key);

        // Also check if token is blacklisted
        if (Boolean.TRUE.equals(exists)) {
            return !isTokenBlacklisted(jti);
        }

        return false;
    }

    /**
     * Check if refresh token exists in Redis
     * @param tokenHash Hashed refresh token
     * @return true if token exists
     */
    public boolean isRefreshTokenValid(String tokenHash) {
        String key = REFRESH_TOKEN_PREFIX + tokenHash;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    /**
     * Blacklist a token (used for logout/revocation)
     * @param jti JWT ID
     * @param remainingTtlSeconds Remaining time until token expires
     */
    public void blacklistToken(String jti, long remainingTtlSeconds) {
        String key = BLACKLIST_PREFIX + jti;
        redisTemplate.opsForValue().set(key, "revoked", remainingTtlSeconds, TimeUnit.SECONDS);
        log.info("Token blacklisted: jti={}", jti);
    }

    /**
     * Check if token is blacklisted
     * @param jti JWT ID
     * @return true if token is blacklisted
     */
    public boolean isTokenBlacklisted(String jti) {
        String key = BLACKLIST_PREFIX + jti;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    /**
     * Remove access token from Redis (used during logout)
     * @param jti JWT ID
     */
    public void removeAccessToken(String jti) {
        String key = ACCESS_TOKEN_PREFIX + jti;
        redisTemplate.delete(key);
        log.debug("Removed access token from Redis: jti={}", jti);
    }

    /**
     * Remove refresh token from Redis
     * @param tokenHash Hashed refresh token
     */
    public void removeRefreshToken(String tokenHash) {
        String key = REFRESH_TOKEN_PREFIX + tokenHash;
        redisTemplate.delete(key);
        log.debug("Removed refresh token from Redis: hash={}", tokenHash.substring(0, 10) + "...");
    }

    /**
     * Get all active sessions for a user
     * @param userId User ID
     * @return Set of active JWT IDs
     */
    public Set<Object> getUserActiveSessions(Integer userId) {
        String key = USER_SESSIONS_PREFIX + userId;
        return redisTemplate.opsForSet().members(key);
    }

    /**
     * Add token to user's active sessions
     * @param userId User ID
     * @param jti JWT ID
     * @param expirySeconds Token expiry in seconds
     */
    private void addToUserSessions(Integer userId, String jti, long expirySeconds) {
        String key = USER_SESSIONS_PREFIX + userId;
        redisTemplate.opsForSet().add(key, jti);
        redisTemplate.expire(key, Duration.ofSeconds(expirySeconds));
    }

    /**
     * Remove token from user's active sessions
     * @param userId User ID
     * @param jti JWT ID
     */
    public void removeFromUserSessions(Integer userId, String jti) {
        String key = USER_SESSIONS_PREFIX + userId;
        redisTemplate.opsForSet().remove(key, jti);
    }

    /**
     * Revoke all sessions for a user (used for "logout all devices")
     * @param userId User ID
     */
    public void revokeAllUserSessions(Integer userId) {
        Set<Object> sessions = getUserActiveSessions(userId);
        if (sessions != null) {
            for (Object jti : sessions) {
                blacklistToken((String) jti, 3600); // Blacklist for 1 hour
                removeAccessToken((String) jti);
            }
        }

        // Clear user sessions set
        String key = USER_SESSIONS_PREFIX + userId;
        redisTemplate.delete(key);

        log.info("Revoked all sessions for user: userId={}, count={}", userId, sessions != null ? sessions.size() : 0);
    }

    /**
     * Get token data from Redis
     * @param jti JWT ID
     * @return Token data map
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getAccessTokenData(String jti) {
        String key = ACCESS_TOKEN_PREFIX + jti;
        Object data = redisTemplate.opsForValue().get(key);
        return data != null ? (Map<String, Object>) data : null;
    }

    /**
     * Get refresh token data from Redis
     * @param tokenHash Hashed refresh token
     * @return Token data map
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getRefreshTokenData(String tokenHash) {
        String key = REFRESH_TOKEN_PREFIX + tokenHash;
        Object data = redisTemplate.opsForValue().get(key);
        return data != null ? (Map<String, Object>) data : null;
    }
}
