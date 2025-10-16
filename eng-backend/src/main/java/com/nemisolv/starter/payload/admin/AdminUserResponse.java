package com.nemisolv.starter.payload.admin;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@Builder
public class AdminUserResponse {
    private String id;
    private String email;
    private String username;
    private String name;
    private List<String> roles;
    private boolean emailVerified;
    private String status;
    private boolean enabled;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastLogin;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    private boolean isOnboarded;

    public static AdminUserResponse fromRs(ResultSet rs) throws SQLException {
        String rolesStr = rs.getString("roles");
        List<String> roles = rolesStr != null && !rolesStr.isEmpty()
                ? Arrays.stream(rolesStr.split(",")).collect(Collectors.toList())
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
                .lastLogin(rs.getTimestamp("last_login_at") != null ? rs.getTimestamp("last_login_at").toLocalDateTime() : null)
                .createdAt(rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toLocalDateTime() : null)
                .updatedAt(rs.getTimestamp("updated_at") != null ? rs.getTimestamp("updated_at").toLocalDateTime() : null)
                .isOnboarded(rs.getBoolean("is_onboarded"))
                .build();
    }
}
