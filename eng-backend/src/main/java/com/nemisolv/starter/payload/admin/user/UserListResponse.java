package com.nemisolv.starter.payload.admin.user;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Response DTO cho danh sách users (simplified version)
 * Dùng cho table listing, không cần toàn bộ chi tiết
 */
@Data
@Builder
public class UserListResponse {

    private Long id;
    private String username;
    private String email;
    private String name;
    private String status;
    private Boolean emailVerified;
    private String provider;

    /**
     * Tên các roles (simplified)
     */
    private Set<String> roleNames;

    /**
     * Số lượng roles
     */
    private Integer roleCount;

    /**
     * Last login timestamp
     */
    private LocalDateTime lastLoginAt;

    /**
     * Account creation time
     */
    private LocalDateTime createdAt;

    /**
     * Is user onboarded
     */
    private Boolean isOnboarded;

    /**
     * Total XP (for quick overview)
     */
    private Integer totalXp;
}
