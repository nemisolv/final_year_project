package com.nemisolv.starter.service;

import com.nemisolv.starter.entity.RefreshToken;
import com.nemisolv.starter.entity.User;
import com.nemisolv.starter.enums.ApiResponseCode;
import com.nemisolv.starter.exception.auth.AuthenticationException;
import com.nemisolv.starter.helper.HashingHelper;
import com.nemisolv.starter.repository.RefreshTokenRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final HashingHelper hashingHelper;

    @Value("${jwt.refresh-token.expiration:604800000}") // 7 days in milliseconds
    private long refreshTokenExpiration;

    @Value("${jwt.max-active-sessions:5}") // Max concurrent sessions per user
    private int maxActiveSessions;

    /**
     * Generate and store a new refresh token
     * @param user The user for whom the refresh token is generated
     * @param accessTokenJti The JTI of the access token to link with this refresh token
     * @return The raw refresh token string
     */
    @Transactional
    public String generateRefreshToken(User user, String accessTokenJti) {
        // Generate cryptographically secure random token
        String rawToken = UUID.randomUUID().toString() + "-" +
                RandomStringUtils.secureStrong().nextAlphanumeric(32);

        // Hash the token for storage
        String tokenHash = hashingHelper.createHashWithSecretKey(rawToken);

        // Get device information
        String deviceInfo = getDeviceInfo();
        String ipAddress = getClientIpAddress();
        String userAgent = getUserAgent();

        // Calculate expiration
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(refreshTokenExpiration / 1000);

        // Create refresh token entity with access token JTI
        RefreshToken refreshToken = RefreshToken.builder()
                .userId(user.getId())
                .token(rawToken) // Store encrypted in production
                .tokenHash(tokenHash)
                .accessTokenJti(accessTokenJti)
                .expiresAt(expiresAt)
                .deviceInfo(deviceInfo)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .createdAt(LocalDateTime.now())
                .revoked(false)
                .build();

        // Check if user has too many active sessions
        int activeSessions = refreshTokenRepository.getActiveSessionCount(user.getId().longValue());
        if (activeSessions >= maxActiveSessions) {
            // Revoke oldest sessions to make room
            List<RefreshToken> activeTokens = refreshTokenRepository.findActiveTokensByUserId(user.getId().longValue());
            if (!activeTokens.isEmpty()) {
                // Revoke the oldest token
                RefreshToken oldestToken = activeTokens.get(activeTokens.size() - 1);
                refreshTokenRepository.revokeToken(oldestToken.getTokenHash());
                log.info("Revoked oldest session for user {} due to session limit", user.getId());
            }
        }

        // Save to database
        Long tokenId = refreshTokenRepository.save(refreshToken);
        if (tokenId == null) {
            throw new AuthenticationException(ApiResponseCode.INTERNAL_ERROR, "Failed to generate refresh token");
        }

        log.info("Generated new refresh token for user {} linked to access token JTI: {}", user.getId(), accessTokenJti);
        return rawToken;
    }

    /**
     * Validate refresh token and prepare for rotation
     * This method validates the token and atomically marks it as used to prevent race conditions
     */
    @Transactional
    public RefreshToken validateAndPrepareRotation(String rawToken) {
        // Hash the token to look it up
        String tokenHash = hashingHelper.createHashWithSecretKey(rawToken);

        // Find the token
        Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByTokenHash(tokenHash);
        if (tokenOpt.isEmpty()) {
            throw new AuthenticationException(ApiResponseCode.INVALID_REFRESH_TOKEN);
        }

        RefreshToken token = tokenOpt.get();

        // CRITICAL: Check if token was already used/replaced (potential token reuse attack!)
        // If a token is stolen and the attacker uses it AFTER the legitimate user already rotated it,
        // this check will detect it because replacedBy will be set
        if (token.getReplacedBy() != null) {
            log.warn("Token reuse detected! Token {} was already replaced by token {}. Revoking entire token family.",
                    token.getId(), token.getReplacedBy());
            refreshTokenRepository.revokeTokenFamily(tokenHash);
            throw new AuthenticationException(ApiResponseCode.TOKEN_REUSE_DETECTED);
        }

        // Check if token is revoked
        if (token.isRevoked()) {
            throw new AuthenticationException(ApiResponseCode.REFRESH_TOKEN_REVOKED);
        }

        // Check if token is expired
        if (token.isExpired()) {
            throw new AuthenticationException(ApiResponseCode.REFRESH_TOKEN_EXPIRED);
        }

        // ATOMICALLY mark token as revoked to prevent race conditions
        // This prevents the same refresh token from being used multiple times concurrently
        int updated = refreshTokenRepository.markAsUsedIfNotRevoked(tokenHash);
        if (updated == 0) {
            // Token was already revoked by another concurrent request
            log.warn("Attempted to use already revoked token: {}", tokenHash);
            throw new AuthenticationException(ApiResponseCode.REFRESH_TOKEN_REVOKED);
        }

        return token;
    }

    /**
     * Complete the token rotation by linking the old token to the new one
     * This creates the rotation chain needed for token reuse detection
     */
    @Transactional
    public void completeRotation(String oldTokenHash, Long newTokenId) {
        refreshTokenRepository.markAsReplaced(oldTokenHash, newTokenId);
        log.debug("Completed token rotation: old token linked to new token {}", newTokenId);
    }

    /**
     * Hash a raw token (public helper method)
     */
    public String hashToken(String rawToken) {
        return hashingHelper.createHashWithSecretKey(rawToken);
    }

    /**
     * Get token ID by its hash
     */
    public Long getTokenIdByHash(String tokenHash) {
        return refreshTokenRepository.findByTokenHash(tokenHash)
                .map(RefreshToken::getId)
                .orElse(null);
    }

    /**
     * Revoke a specific refresh token
     */
    @Transactional
    public void revokeToken(String rawToken) {
        String tokenHash = hashingHelper.createHashWithSecretKey(rawToken);
        refreshTokenRepository.revokeToken(tokenHash);
        log.info("Revoked refresh token");
    }

    /**
     * Revoke all refresh tokens for a user (logout from all devices)
     */
    @Transactional
    public int revokeAllUserTokens(Long userId) {
        int revoked = refreshTokenRepository.revokeAllTokensForUser(userId);
        log.info("Revoked all tokens for user {}: {} tokens", userId, revoked);
        return revoked;
    }

    /**
     * Get all active sessions for a user
     */
    public List<RefreshToken> getActiveUserSessions(Long userId) {
        return refreshTokenRepository.findActiveTokensByUserId(userId);
    }

    /**
     * Revoke refresh token by access token JTI
     */
    public void revokeTokenByAccessTokenJti(String accessTokenJti) {
        refreshTokenRepository.revokeByAccessTokenJti(accessTokenJti);
        log.info("Revoked refresh token by access token JTI: {}", accessTokenJti);
    }

    /**
     * Cleanup expired tokens (scheduled task)
     */
    @Transactional
    public void cleanupExpiredTokens() {
        int deleted = refreshTokenRepository.deleteExpiredTokens();
        log.info("Cleaned up {} expired refresh tokens", deleted);
    }

    // Helper methods to get request context information

    private String getDeviceInfo() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) return "unknown";

            HttpServletRequest request = attributes.getRequest();
            String userAgent = request.getHeader("User-Agent");

            if (userAgent != null) {
                if (userAgent.contains("Mobile")) return "Mobile";
                if (userAgent.contains("Tablet")) return "Tablet";
                return "Desktop";
            }
            return "unknown";
        } catch (Exception e) {
            return "unknown";
        }
    }

    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) return "unknown";

            HttpServletRequest request = attributes.getRequest();
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }

            String xRealIp = request.getHeader("X-Real-IP");
            if (xRealIp != null && !xRealIp.isEmpty()) {
                return xRealIp;
            }

            return request.getRemoteAddr();
        } catch (Exception e) {
            return "unknown";
        }
    }

    private String getUserAgent() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) return "unknown";

            HttpServletRequest request = attributes.getRequest();
            String userAgent = request.getHeader("User-Agent");
            return userAgent != null ? userAgent : "unknown";
        } catch (Exception e) {
            return "unknown";
        }
    }
}
