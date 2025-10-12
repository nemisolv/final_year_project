package com.nemisolv.starter.payload.profile;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.nemisolv.starter.enums.UserSkillLevel;

import java.time.LocalDate;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record UserOnboardingRequest(
        LocalDate dob,
        int dailyStudyGoalInMinutes,
        String shortIntroduction,
        UserSkillLevel englishLevel,
        String learningGoals
) {
    // Jackson will automatically convert camelCase to snake_case
    // Client sends: {"dob": "2000-01-01", "daily_study_goal_in_minutes": 30}
    // Java receives: dob, dailyStudyGoalInMinutes
    // Note: userId is derived from JWT token, not from request body
}
