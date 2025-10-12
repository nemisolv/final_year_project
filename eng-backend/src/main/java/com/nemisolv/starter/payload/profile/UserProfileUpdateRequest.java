package com.nemisolv.starter.payload.profile;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.nemisolv.starter.enums.UserSkillLevel;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UserProfileUpdateRequest(
        @Size(max = 100, message = "Name must not exceed 100 characters")
        String name,

        @Size(max = 50, message = "Username must not exceed 50 characters")
        String username,

        LocalDate dob,

        UserSkillLevel englishLevel,

        String learningGoals,

        String preferredAccent,

        @Min(value = 5, message = "Daily study goal must be at least 5 minutes")
        Integer dailyStudyGoal,

        Boolean notificationEnabled,

        String privacyLevel
) {
    // All fields are optional, so users can update only what they want
    // Snake case naming is handled automatically by Jackson
}
