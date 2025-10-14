package com.nemisolv.starter.payload.admin.user;

import com.nemisolv.starter.payload.admin.role.RoleResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Chi tiết đầy đủ thông tin user (cho admin)
 * Bao gồm roles, permissions, profile info
 */
@Data
@Builder
public class UserDetailResponse {

    private Long id;
    private String username;
    private String email;
    private String name;
    private String status;
    private Boolean emailVerified;
    private String provider;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Danh sách roles của user
     */
    private Set<RoleResponse> roles;

    /**
     * Profile information (nếu có)
     */
    private UserProfileInfo profile;

    /**
     * Statistics
     */
    private UserStatistics stats;

    @Data
    @Builder
    public static class UserProfileInfo {
        private String englishLevel;
        private String learningGoals;
        private String preferredAccent;
        private Integer dailyStudyGoal;
        private String timezone;
        private Boolean notificationEnabled;
        private String privacyLevel;
        private String bio;
        private Boolean isOnboarded;
    }

    @Data
    @Builder
    public static class UserStatistics {
        private Integer totalXp;
        private Integer currentLevel;
        private Integer lessonsCompleted;
        private Integer exercisesCompleted;
        private Integer currentStreakDays;
        private Integer longestStreakDays;
    }
}
