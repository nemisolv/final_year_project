package com.nemisolv.starter.util;

import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Utility class for extracting information from JWT tokens
 * Provides type-safe methods to avoid repetitive claim extraction code
 */
public final class JwtUtils {

    private JwtUtils() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }

    /**
     * Extract user ID from JWT claims
     * Handles both Long and Integer types safely
     *
     * @param jwt The JWT token
     * @return User ID as Integer
     * @throws IllegalStateException if userId claim is not found
     */
    public static Integer getUserId(Jwt jwt) {
        if (jwt == null) {
            throw new IllegalArgumentException("JWT cannot be null");
        }

        Object userIdClaim = jwt.getClaims().get("userId");
        if (userIdClaim == null) {
            throw new IllegalStateException("User ID not found in JWT claims");
        }

        // Handle both Long and Integer types from JWT claims
        if (userIdClaim instanceof Long) {
            return ((Long) userIdClaim).intValue();
        } else if (userIdClaim instanceof Integer) {
            return (Integer) userIdClaim;
        } else if (userIdClaim instanceof Number) {
            return ((Number) userIdClaim).intValue();
        } else {
            throw new IllegalStateException("User ID claim is not a number: " + userIdClaim.getClass());
        }
    }

    /**
     * Extract email from JWT claims
     *
     * @param jwt The JWT token
     * @return User email
     */
    public static String getEmail(Jwt jwt) {
        if (jwt == null) {
            throw new IllegalArgumentException("JWT cannot be null");
        }

        Object emailClaim = jwt.getClaims().get("email");
        if (emailClaim == null) {
            throw new IllegalStateException("Email not found in JWT claims");
        }

        return emailClaim.toString();
    }

    /**
     * Extract subject (typically email) from JWT
     *
     * @param jwt The JWT token
     * @return Subject claim
     */
    public static String getSubject(Jwt jwt) {
        if (jwt == null) {
            throw new IllegalArgumentException("JWT cannot be null");
        }
        return jwt.getSubject();
    }

    /**
     * Extract JWT ID (jti) from JWT
     *
     * @param jwt The JWT token
     * @return JWT ID
     */
    public static String getJwtId(Jwt jwt) {
        if (jwt == null) {
            throw new IllegalArgumentException("JWT cannot be null");
        }
        return jwt.getId();
    }
}
