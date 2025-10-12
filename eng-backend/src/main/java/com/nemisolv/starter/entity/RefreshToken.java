package com.nemisolv.starter.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {
    private Long id;
    private Integer userId;
    private String token;
    private String tokenHash;
    private String accessTokenJti; // JTI of the access token associated with this refresh token
    private LocalDateTime expiresAt;
    private boolean revoked;
    private LocalDateTime revokedAt;
    private String deviceInfo;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime createdAt;
    private LocalDateTime lastUsedAt;
    private Long replacedBy; // Token rotation: ID of the new token that replaced this one

    public static RefreshToken fromRs(ResultSet rs) throws SQLException {
        return RefreshToken.builder()
                .id(rs.getLong("id"))
                .userId(rs.getInt("user_id"))
                .token(rs.getString("token"))
                .tokenHash(rs.getString("token_hash"))
                .accessTokenJti(rs.getString("access_token_jti"))
                .expiresAt(rs.getTimestamp("expires_at") != null ?
                        rs.getTimestamp("expires_at").toLocalDateTime() : null)
                .revoked(rs.getBoolean("revoked"))
                .revokedAt(rs.getTimestamp("revoked_at") != null ?
                        rs.getTimestamp("revoked_at").toLocalDateTime() : null)
                .deviceInfo(rs.getString("device_info"))
                .ipAddress(rs.getString("ip_address"))
                .userAgent(rs.getString("user_agent"))
                .createdAt(rs.getTimestamp("created_at") != null ?
                        rs.getTimestamp("created_at").toLocalDateTime() : null)
                .lastUsedAt(rs.getTimestamp("last_used_at") != null ?
                        rs.getTimestamp("last_used_at").toLocalDateTime() : null)
                .replacedBy(rs.getObject("replaced_by") != null ?
                        rs.getLong("replaced_by") : null)
                .build();
    }

    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(LocalDateTime.now());
    }

    public boolean isValid() {
        return !revoked && !isExpired();
    }
}
