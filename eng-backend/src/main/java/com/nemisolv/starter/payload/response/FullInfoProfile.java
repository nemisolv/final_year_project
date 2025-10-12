package com.nemisolv.starter.payload.response;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    private List<String> roles;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private boolean isOnboarded;
    private String englishLevel;
    private String learningGoals;
    private String preferredAccent;
    private int dailyStudyGoal;
    private boolean notificationEnabled;
    private String privacyLevel;
    private String name;
    private LocalDateTime dob;

    public static FullInfoProfile fromRs(ResultSet rs) throws SQLException {
        return FullInfoProfile.builder()
                .id(rs.getInt("id"))
                .userId(rs.getInt("user_id"))
                .email(rs.getString("email"))
                .username(rs.getString("username"))
                .englishLevel(rs.getString("english_level"))
                .learningGoals(rs.getString("learning_goals"))
                .dailyStudyGoal(rs.getInt("daily_study_goal"))
                .isOnboarded(rs.getBoolean("is_onboarded"))
                .preferredAccent(rs.getString("preferred_accent"))
                .notificationEnabled(rs.getBoolean("notification_enabled"))
                .privacyLevel(rs.getString("privacy_level"))
                .name(rs.getString("name"))
                .dob(rs.getTimestamp("dob") != null ? rs.getTimestamp("dob").toLocalDateTime() : null)
//                .lastLogin(rs.getTimestamp("last_login_at") != null ? rs.getTimestamp("last_login_at").toLocalDateTime() : null)
                .build();
    }

}
