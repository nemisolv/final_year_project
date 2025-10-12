package com.nemisolv.starter.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDashboardStatsResponse {
    private Integer currentStreakDays;
    private Integer dailyStudyGoalMinutes;
    private Integer minutesStudiedToday;
    private Integer totalXp;
    private Integer currentLevel;
    private Integer totalStudyTime;
    private Integer lessonsCompleted;
    private Integer exercisesCompleted;
}