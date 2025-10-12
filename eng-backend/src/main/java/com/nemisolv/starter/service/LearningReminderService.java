package com.nemisolv.starter.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for sending daily learning reminders to users
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class LearningReminderService {

    @Qualifier("mariadbJdbcTemplate")
    private final JdbcTemplate mariadbJdbcTemplate;

    private final EmailService emailService;

    /**
     * DTO for users who need learning reminders
     */
    public record UserReminderInfo(
            Long userId,
            String name,
            String email,
            Integer dailyStudyGoal,
            Integer currentStreak,
            Integer totalXp,
            Integer currentLevel,
            LocalDate lastActivityDate
    ) {}

    /**
     * Find users who haven't studied today and should receive a reminder
     * Only sends to users who:
     * 1. Have notifications enabled
     * 2. Are active
     * 3. Haven't studied today (last_activity_date is not today)
     */
    public List<UserReminderInfo> findUsersNeedingReminder() {
        String sql = """
            SELECT
                up.user_id,
                up.name,
                up.email,
                up.daily_study_goal,
                COALESCE(us.current_streak_days, 0) as current_streak,
                COALESCE(us.total_xp, 0) as total_xp,
                COALESCE(us.current_level, 1) as current_level,
                us.last_activity_date
            FROM user_profiles up
            JOIN users u ON up.user_id = u.id
            LEFT JOIN user_stats us ON up.user_id = us.user_id
            WHERE
                u.status = 'ACTIVE'
                AND up.notification_enabled = 1
                AND (us.last_activity_date IS NULL OR us.last_activity_date < CURDATE())
            """;

        return mariadbJdbcTemplate.query(sql, (rs, rowNum) -> {
            java.sql.Date lastActivityDate = rs.getDate("last_activity_date");
            return new UserReminderInfo(
                rs.getLong("user_id"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getInt("daily_study_goal"),
                rs.getInt("current_streak"),
                rs.getInt("total_xp"),
                rs.getInt("current_level"),
                lastActivityDate != null ? lastActivityDate.toLocalDate() : null
            );
        });
    }

    /**
     * Send learning reminder email to a user
     */
    public void sendReminderEmail(UserReminderInfo user) {
        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("userName", user.name());
            variables.put("dailyGoal", user.dailyStudyGoal() != null ? user.dailyStudyGoal() : 30);
            variables.put("currentStreak", user.currentStreak());
            variables.put("currentLevel", user.currentLevel());
            variables.put("totalXp", user.totalXp());

            // Add motivational message based on streak
            String motivation;
            if (user.currentStreak() == 0) {
                motivation = "Start your learning journey today!";
            } else if (user.currentStreak() < 7) {
                motivation = "Keep it up! You're building a great habit!";
            } else if (user.currentStreak() < 30) {
                motivation = "Amazing streak! Don't break it now!";
            } else {
                motivation = "Incredible dedication! You're unstoppable!";
            }
            variables.put("motivation", motivation);

            emailService.sendEmail(
                user.email(),
                "⏰ Daily Learning Reminder - Keep Your Streak Going!",
                "learning-reminder",
                variables
            );

            log.info("Learning reminder email sent successfully to user: {} ({})", user.name(), user.email());

        } catch (Exception e) {
            log.error("Failed to send learning reminder email to user: {} ({})", user.name(), user.email(), e);
        }
    }

    /**
     * Process daily learning reminders for all eligible users
     */
    public void processDailyReminders() {
        log.info("Starting daily learning reminder process...");

        List<UserReminderInfo> usersNeedingReminder = findUsersNeedingReminder();

        if (usersNeedingReminder.isEmpty()) {
            log.info("No users need learning reminders today");
            return;
        }

        log.info("Found {} user(s) who need learning reminders", usersNeedingReminder.size());

        for (UserReminderInfo user : usersNeedingReminder) {
            sendReminderEmail(user);
        }

        log.info("Daily learning reminder process completed. Sent {} email(s)", usersNeedingReminder.size());
    }

    /**
     * Find users at risk of losing their streak (haven't studied today and have an active streak)
     */
    public List<UserReminderInfo> findUsersAtRiskOfLosingStreak() {
        String sql = """
            SELECT
                up.user_id,
                up.name,
                up.email,
                up.daily_study_goal,
                COALESCE(us.current_streak_days, 0) as current_streak,
                COALESCE(us.total_xp, 0) as total_xp,
                COALESCE(us.current_level, 1) as current_level,
                us.last_activity_date
            FROM user_profiles up
            JOIN users u ON up.user_id = u.id
            LEFT JOIN user_stats us ON up.user_id = us.user_id
            WHERE
                u.status = 'ACTIVE'
                AND up.notification_enabled = 1
                AND us.current_streak_days > 0
                AND (us.last_activity_date IS NULL OR us.last_activity_date < CURDATE())
            """;

        return mariadbJdbcTemplate.query(sql, (rs, rowNum) -> {
            java.sql.Date lastActivityDate = rs.getDate("last_activity_date");
            return new UserReminderInfo(
                rs.getLong("user_id"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getInt("daily_study_goal"),
                rs.getInt("current_streak"),
                rs.getInt("total_xp"),
                rs.getInt("current_level"),
                lastActivityDate != null ? lastActivityDate.toLocalDate() : null
            );
        });
    }

    /**
     * Send urgent reminder to users at risk of losing their streak
     */
    public void sendStreakWarningEmail(UserReminderInfo user) {
        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("userName", user.name());
            variables.put("currentStreak", user.currentStreak());
            variables.put("dailyGoal", user.dailyStudyGoal() != null ? user.dailyStudyGoal() : 30);

            emailService.sendEmail(
                user.email(),
                "🔥 Don't Lose Your " + user.currentStreak() + "-Day Streak!",
                "streak-warning",
                variables
            );

            log.info("Streak warning email sent to user: {} ({})", user.name(), user.email());

        } catch (Exception e) {
            log.error("Failed to send streak warning email to user: {} ({})", user.name(), user.email(), e);
        }
    }

    /**
     * Process streak warnings (typically in the evening)
     */
    public void processStreakWarnings() {
        log.info("Starting streak warning process...");

        List<UserReminderInfo> usersAtRisk = findUsersAtRiskOfLosingStreak();

        if (usersAtRisk.isEmpty()) {
            log.info("No users at risk of losing their streak");
            return;
        }

        log.info("Found {} user(s) at risk of losing their streak", usersAtRisk.size());

        for (UserReminderInfo user : usersAtRisk) {
            sendStreakWarningEmail(user);
        }

        log.info("Streak warning process completed. Sent {} email(s)", usersAtRisk.size());
    }
}