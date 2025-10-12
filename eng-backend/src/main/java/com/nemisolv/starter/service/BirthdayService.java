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

@Service
@Slf4j
@RequiredArgsConstructor
public class BirthdayService {

    @Qualifier("mariadbJdbcTemplate")
    private final JdbcTemplate mariadbJdbcTemplate;

    private final EmailService emailService;

    /**
     * DTO for users with birthdays
     */
    public record UserBirthday(
            Long userId,
            String name,
            String email,
            LocalDate dob
    ) {}

    /**
     * Find all users who have birthday today
     */
    public List<UserBirthday> findUsersWithBirthdayToday() {
        String sql = """
            SELECT
                up.user_id,
                up.name,
                up.email,
                up.dob
            FROM user_profiles up
            JOIN users u ON up.user_id = u.id
            WHERE
                up.dob IS NOT NULL
                AND MONTH(up.dob) = MONTH(CURDATE())
                AND DAY(up.dob) = DAY(CURDATE())
                AND u.status = 'ACTIVE'
                AND up.notification_enabled = 1
            """;

        return mariadbJdbcTemplate.query(sql, (rs, rowNum) ->
            new UserBirthday(
                rs.getLong("user_id"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getDate("dob").toLocalDate()
            )
        );
    }

    /**
     * Send birthday email to a user
     */
    public void sendBirthdayEmail(UserBirthday user) {
        try {
            int age = calculateAge(user.dob());

            Map<String, Object> variables = new HashMap<>();
            variables.put("userName", user.name());
            variables.put("age", age);

            emailService.sendEmail(
                user.email(),
                "🎉 Happy Birthday from English Learning Platform! 🎂",
                "birthday-wishes",
                variables
            );

            log.info("Birthday email sent successfully to user: {} ({})", user.name(), user.email());

        } catch (Exception e) {
            log.error("Failed to send birthday email to user: {} ({})", user.name(), user.email(), e);
        }
    }

    /**
     * Send birthday emails to all users with birthday today
     */
    public void processBirthdayNotifications() {
        log.info("Starting birthday notification process...");

        List<UserBirthday> usersWithBirthday = findUsersWithBirthdayToday();

        if (usersWithBirthday.isEmpty()) {
            log.info("No users with birthday today");
            return;
        }

        log.info("Found {} user(s) with birthday today", usersWithBirthday.size());

        for (UserBirthday user : usersWithBirthday) {
            sendBirthdayEmail(user);
        }

        log.info("Birthday notification process completed. Sent {} email(s)", usersWithBirthday.size());
    }

    /**
     * Calculate user's age from date of birth
     */
    private int calculateAge(LocalDate dob) {
        LocalDate today = LocalDate.now();
        return today.getYear() - dob.getYear();
    }

    /**
     * Additional action: You can add bonus XP or achievements for birthday users
     */
    public void grantBirthdayBonus(UserBirthday user) {
        try {
            // Grant bonus XP or special achievement
            String sql = """
                UPDATE user_stats
                SET total_xp = total_xp + 100
                WHERE user_id = ?
                """;

            int updated = mariadbJdbcTemplate.update(sql, user.userId());

            if (updated > 0) {
                log.info("Granted birthday bonus XP to user: {}", user.name());
            }

        } catch (Exception e) {
            log.error("Failed to grant birthday bonus to user: {}", user.name(), e);
        }
    }
}