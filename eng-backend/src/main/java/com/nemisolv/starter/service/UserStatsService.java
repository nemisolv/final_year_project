package com.nemisolv.starter.service;

import com.nemisolv.starter.entity.LearningStreak;
import com.nemisolv.starter.entity.UserStats;
import com.nemisolv.starter.payload.response.FullInfoProfile;
import com.nemisolv.starter.payload.response.UserDashboardStatsResponse;
import com.nemisolv.starter.repository.LearningStreakRepository;
import com.nemisolv.starter.repository.UserProfileRepository;
import com.nemisolv.starter.repository.UserStatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserStatsService {

    private final UserStatsRepository userStatsRepository;
    private final LearningStreakRepository learningStreakRepository;
    private final UserProfileRepository userProfileRepository;

    public UserDashboardStatsResponse getDashboardStats(Long userId) {
        // Get or create user stats
        UserStats userStats = userStatsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    log.info("User stats not found for userId: {}, creating new stats", userId);
                    try {
                        userStatsRepository.createUserStats(userId);
                    } catch (Exception e) {
                        // If duplicate key error, it means another thread created it, just fetch it
                        log.warn("Failed to create user stats for userId: {}, likely already exists: {}", userId, e.getMessage());
                    }
                    return userStatsRepository.findByUserId(userId)
                            .orElseThrow(() -> new RuntimeException("Failed to create or fetch user stats"));
                });

        // Get today's learning streak
        LocalDate today = LocalDate.now();
        Optional<LearningStreak> todayStreakOpt = learningStreakRepository.findByUserIdAndDate(userId, today);

        int minutesStudiedToday = 0;
        if (todayStreakOpt.isPresent()) {
            minutesStudiedToday = todayStreakOpt.get().getMinutesStudied();
        } else {
            // Create initial streak for today if not exists
            try {
                learningStreakRepository.createInitialStreak(userId);
            } catch (Exception e) {
                // If duplicate, another thread created it, just fetch it
                log.warn("Failed to create initial streak for userId: {}, likely already exists: {}", userId, e.getMessage());
                todayStreakOpt = learningStreakRepository.findByUserIdAndDate(userId, today);
                if (todayStreakOpt.isPresent()) {
                    minutesStudiedToday = todayStreakOpt.get().getMinutesStudied();
                }
            }
        }

        // Get user profile for daily goal
        FullInfoProfile profile = userProfileRepository.getFullProfile(userId.intValue());
        int dailyGoal = (profile != null && profile.getDailyStudyGoal() > 0)
            ? profile.getDailyStudyGoal()
            : 30; // default 30 minutes

        return UserDashboardStatsResponse.builder()
                .currentStreakDays(userStats.getCurrentStreakDays() != null ? userStats.getCurrentStreakDays() : 0)
                .dailyStudyGoalMinutes(dailyGoal)
                .minutesStudiedToday(minutesStudiedToday)
                .totalXp(userStats.getTotalXp() != null ? userStats.getTotalXp() : 0)
                .currentLevel(userStats.getCurrentLevel() != null ? userStats.getCurrentLevel() : 1)
                .totalStudyTime(userStats.getTotalStudyTime() != null ? userStats.getTotalStudyTime() : 0)
                .lessonsCompleted(userStats.getLessonsCompleted() != null ? userStats.getLessonsCompleted() : 0)
                .exercisesCompleted(userStats.getExercisesCompleted() != null ? userStats.getExercisesCompleted() : 0)
                .build();
    }
}