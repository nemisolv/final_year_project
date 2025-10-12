package com.nemisolv.starter.service;

import com.nemisolv.starter.config.AppProperties;
import com.nemisolv.starter.entity.Permission;
import com.nemisolv.starter.entity.Role;
import com.nemisolv.starter.enums.ApiResponseCode;
import com.nemisolv.starter.exception.auth.AuthenticationException;
import com.nemisolv.starter.security.UserPrincipal;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.StringJoiner;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class JwtService  {
    private final AppProperties appProperties;
    private final TokenStorageService tokenStorageService;

    /**
     * Generate JWT access token with minimal claims
     * Only includes user ID, email, and role names (no permissions)
     * Permissions are verified in real-time from database for security
     */
    public String generateToken(UserPrincipal user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);

        String jti = UUID.randomUUID().toString();
        long expirySeconds = appProperties.getSecure().getTokenExpire();


        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(expirySeconds, ChronoUnit.SECONDS).toEpochMilli()
                ))
                .jwtID(jti)
                .claim("userId", user.getId())
                .claim("email", user.getEmail())
                .claim("roles", user.getRoles()) // Only role names, permissions verified from DB
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(appProperties.getSecure().getSecretKey().getBytes()));
            String token = jwsObject.serialize();

            // Store access token in Redis with TTL
            tokenStorageService.storeAccessToken(jti, user.getId(), expirySeconds);
            log.debug("Generated and stored access token: jti={}, userId={}, roles={}", jti, user.getId(), user.getRoles());

            return token;
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new RuntimeException(e);
        }
    }
    
//    public String generateRefreshToken(UserPrincipal userPrincipal) {
//        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
//
//        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
//                .subject(userPrincipal.getEmail())
//                .issueTime(new Date())
//                .expirationTime(new Date(
//                        Instant.now().plus(appProperties.getSecure().getRefreshTokenExpire(), ChronoUnit.SECONDS).toEpochMilli()
//                ))
//                .jwtID(UUID.randomUUID().toString())
//                .claim("type", "refresh")
//                .build();
//
//        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
//
//        JWSObject jwsObject = new JWSObject(header, payload);
//
//        try {
//            jwsObject.sign(new MACSigner(appProperties.getSecure().getSecretKey().getBytes()));
//            return jwsObject.serialize();
//        } catch (JOSEException e) {
//            log.error("Cannot create refresh token", e);
//            throw new RuntimeException(e);
//        }
//    }

    public SignedJWT verifyToken(String token, boolean isRefresh) throws Exception {
        JWSVerifier verifier = new MACVerifier(appProperties.getSecure().getSecretKey().getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = (isRefresh)
                ? new Date(signedJWT.getJWTClaimsSet().getIssueTime()
                .toInstant().plus(appProperties.getSecure().getRefreshTokenExpire(), ChronoUnit.SECONDS).toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        if (!(verified && expiryTime.after(new Date()))) throw new AuthenticationException(ApiResponseCode.BAD_CREDENTIALS);

        return signedJWT;
    }


    public SecretKey getSecretKey() {
        String secretKey = appProperties.getSecure().getSecretKey();
        return new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }
    
    public boolean validateToken(String token) {
        try {
            SignedJWT signedJWT = verifyToken(token, false);

            // Extract JTI and check Redis
            String jti = signedJWT.getJWTClaimsSet().getJWTID();

            // Check if token is blacklisted
            if (tokenStorageService.isTokenBlacklisted(jti)) {
                log.warn("Token is blacklisted: jti={}", jti);
                return false;
            }

            // Check if token exists in Redis (optional - for stricter validation)
            if (!tokenStorageService.isAccessTokenValid(jti)) {
                log.warn("Token not found in Redis or revoked: jti={}", jti);
                return false;
            }

            return true;
        } catch (Exception e) {
            log.debug("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Revoke a token by adding it to blacklist
     * @param token JWT token string
     */
    public void revokeToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            String jti = signedJWT.getJWTClaimsSet().getJWTID();
            Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

            // Calculate remaining TTL
            long remainingTtl = (expiryTime.getTime() - System.currentTimeMillis()) / 1000;
            if (remainingTtl > 0) {
                tokenStorageService.blacklistToken(jti, remainingTtl);
                tokenStorageService.removeAccessToken(jti);

                // Extract userId and remove from user sessions
                Object userIdClaim = signedJWT.getJWTClaimsSet().getClaim("userId");
                if (userIdClaim != null) {
                    Integer userId = userIdClaim instanceof Long ? ((Long) userIdClaim).intValue() : (Integer) userIdClaim;
                    tokenStorageService.removeFromUserSessions(userId, jti);
                }

                log.info("Token revoked: jti={}", jti);
            }
        } catch (ParseException e) {
            log.error("Error revoking token", e);
        }
    }

    /**
     * Extract JTI from token
     * @param token JWT token string
     * @return JWT ID (jti)
     */
    public String extractJti(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet().getJWTID();
        } catch (ParseException e) {
            log.error("Error extracting JTI from token", e);
            return null;
        }
    }

    /**
     * Extract user ID from token
     * @param token JWT token string
     * @return User ID
     */
    public Integer extractUserId(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            Object userIdClaim = signedJWT.getJWTClaimsSet().getClaim("userId");
            if (userIdClaim == null) {
                return null;
            }
            return userIdClaim instanceof Long ? ((Long) userIdClaim).intValue() : (Integer) userIdClaim;
        } catch (ParseException e) {
            log.error("Error extracting user ID from token", e);
            return null;
        }
    }
}
