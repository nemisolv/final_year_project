package com.nemisolv.starter.repository;

import com.nemisolv.starter.payload.profile.CreateUserProfileRequest;
import com.nemisolv.starter.payload.profile.UserOnboardingRequest;
import com.nemisolv.starter.payload.profile.UserProfileUpdateRequest;
import com.nemisolv.starter.payload.response.FullInfoProfile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Repository
@RequiredArgsConstructor
public class UserProfileRepository {
    @Qualifier("mariadbJdbcTemplate")
    private final JdbcTemplate mariadbJdbcTemplate;

    @Qualifier("namedParameterJdbcTemplate")
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;



    public void onboarding(Integer userId, UserOnboardingRequest request) {
        // note that: need to check if already onboarded
        String sqlChecker = "SELECT * FROM user_profiles WHERE user_id = :userId AND is_onboarded = 1";
        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        List<FullInfoProfile> userProfileList = namedParameterJdbcTemplate.query(sqlChecker, params, ((rs, rowNum) -> FullInfoProfile.fromRs(rs)));
        if(!userProfileList.isEmpty()) {
            log.warn("User already onboarded");
            return;
        }
        params.put("englishLevel", request.englishLevel().getValue());
        params.put("dob", request.dob());
        params.put("learningGoals", request.learningGoals());
        params.put("dailyStudyGoalInMinutes", request.dailyStudyGoalInMinutes());
        params.put("bio", request.shortIntroduction());
        params.put("isOnboarded", true);
        String sqlOnboarding = "UPDATE user_profiles SET english_level = :englishLevel, dob = :dob, bio = :bio, learning_goals = :learningGoals, daily_study_goal = :dailyStudyGoalInMinutes, is_onboarded = :isOnboarded WHERE user_id = :userId";
        namedParameterJdbcTemplate.update(sqlOnboarding, params);

    }


    public void createUserProfile(CreateUserProfileRequest request) {
        String sql = "INSERT INTO user_profiles (user_id, email, username, name, is_onboarded) VALUES (:userId, :email, :username, :name,:is_onboarded)";
        Map<String, Object> params = new HashMap<>();
        params.put("userId", request.userId());
        params.put("email", request.email());
        params.put("username", request.username());
        params.put("is_onboarded", request.isOnboarded());
        params.put("name", request.name());
        namedParameterJdbcTemplate.update(sql, params);
    }


    public FullInfoProfile getFullProfile(Integer userId) {
        String sql = "SELECT * FROM user_profiles p JOIN user_roles r ON p.user_id = r.user_id WHERE p.user_id = ?";
        List<FullInfoProfile> infos = mariadbJdbcTemplate.query(sql, new Object[]{userId}, (rs, rowNum) -> FullInfoProfile.fromRs(rs));
        return !infos.isEmpty() ? infos.get(0) : null;
    }

    public void updateUserProfile(Integer userId, UserProfileUpdateRequest request) {
        StringBuilder sql = new StringBuilder("UPDATE user_profiles SET ");
        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);

        boolean first = true;

        if (request.name() != null) {
            if (!first) sql.append(", ");
            sql.append("name = :name");
            params.put("name", request.name());
            first = false;
        }

        if (request.username() != null) {
            if (!first) sql.append(", ");
            sql.append("username = :username");
            params.put("username", request.username());
            first = false;
        }

        if (request.dob() != null) {
            if (!first) sql.append(", ");
            sql.append("dob = :dob");
            params.put("dob", request.dob());
            first = false;
        }

        if (request.englishLevel() != null) {
            if (!first) sql.append(", ");
            sql.append("english_level = :englishLevel");
            params.put("englishLevel", request.englishLevel().getValue());
            first = false;
        }

        if (request.learningGoals() != null) {
            if (!first) sql.append(", ");
            sql.append("learning_goals = :learningGoals");
            params.put("learningGoals", request.learningGoals());
            first = false;
        }

        if (request.preferredAccent() != null) {
            if (!first) sql.append(", ");
            sql.append("preferred_accent = :preferredAccent");
            params.put("preferredAccent", request.preferredAccent());
            first = false;
        }

        if (request.dailyStudyGoal() != null) {
            if (!first) sql.append(", ");
            sql.append("daily_study_goal = :dailyStudyGoal");
            params.put("dailyStudyGoal", request.dailyStudyGoal());
            first = false;
        }

        if (request.notificationEnabled() != null) {
            if (!first) sql.append(", ");
            sql.append("notification_enabled = :notificationEnabled");
            params.put("notificationEnabled", request.notificationEnabled());
            first = false;
        }

        if (request.privacyLevel() != null) {
            if (!first) sql.append(", ");
            sql.append("privacy_level = :privacyLevel");
            params.put("privacyLevel", request.privacyLevel());
            first = false;
        }

        if (first) {
            log.warn("No fields to update for user {}", userId);
            return;
        }

        sql.append(" WHERE user_id = :userId");
        namedParameterJdbcTemplate.update(sql.toString(), params);
        log.info("Updated profile for user {}", userId);
    }

}
