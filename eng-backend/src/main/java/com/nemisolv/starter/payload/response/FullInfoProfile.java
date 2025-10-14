package com.nemisolv.starter.payload.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class FullInfoProfile {
    private int id;
    private Integer userId;
    private String email;
    private String username;
    private boolean emailVerified;
//    private List<String> roles;
    @JsonProperty("isOnboarded")  // jackson will convert to onboarded by default
    private boolean isOnboarded;
    private String englishLevel;
    private String learningGoals;
    private String preferredAccent;
    private int dailyStudyGoal;
    private boolean notificationEnabled;
    private String privacyLevel;
    private String name;
    private LocalDateTime dob;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;

    public static FullInfoProfile fromRs(ResultSet rs) throws SQLException {
        return FullInfoProfile.builder()
                .id(rs.getInt("id"))
                .userId(rs.getInt("user_id"))
                .email(rs.getString("email"))
                .emailVerified(rs.getBoolean("email_verified"))
                .username(rs.getString("username"))
                .englishLevel(rs.getString("english_level"))
                .learningGoals(rs.getString("learning_goals"))
                .dailyStudyGoal(rs.getInt("daily_study_goal"))
                .isOnboarded(rs.getBoolean("is_onboarded"))
                .preferredAccent(rs.getString("preferred_accent"))
                .notificationEnabled(rs.getBoolean("notification_enabled"))
                .privacyLevel(rs.getString("privacy_level"))
                .avatarUrl(rs.getString("avatar_url"))
                .name(rs.getString("name"))
                .dob(rs.getTimestamp("dob") != null ? rs.getTimestamp("dob").toLocalDateTime() : null)
                .createdAt(rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toLocalDateTime() : null)
                .updatedAt(rs.getTimestamp("updated_at") !=  null ? rs.getTimestamp("updated_at").toLocalDateTime() : null)
                .lastLoginAt(rs.getTimestamp("last_login_at") != null ? rs.getTimestamp("last_login_at").toLocalDateTime() : null)
                .build();
    }

}
