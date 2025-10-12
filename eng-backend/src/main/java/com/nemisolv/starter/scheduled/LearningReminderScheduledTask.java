package com.nemisolv.starter.scheduled;

import com.nemisolv.starter.service.LearningReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled tasks for sending daily learning reminders to users
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class LearningReminderScheduledTask {

    private final LearningReminderService learningReminderService;

    /**
     * Send daily learning reminders to users who haven't studied today
     * Runs every day at 10:00 AM (server time)
     *
     * Cron expression: "0 0 10 * * *"
     * - Second: 0
     * - Minute: 0
     * - Hour: 10
     * - Day of month: *
     * - Month: *
     * - Day of week: *
     */
    @Scheduled(cron = "0 0 10 * * *")
    public void sendDailyLearningReminders() {
        log.info("=== Daily Learning Reminder Task Started ===");

        try {
            learningReminderService.processDailyReminders();
        } catch (Exception e) {
            log.error("Error occurred while processing daily learning reminders", e);
        }

        log.info("=== Daily Learning Reminder Task Completed ===");
    }

    /**
     * Send evening reminder to users at risk of losing their streak
     * Runs every day at 8:00 PM (server time)
     *
     * Cron expression: "0 0 20 * * *"
     * - Second: 0
     * - Minute: 0
     * - Hour: 20
     * - Day of month: *
     * - Month: *
     * - Day of week: *
     */
    @Scheduled(cron = "0 0 20 * * *")
    public void sendStreakWarnings() {
        log.info("=== Streak Warning Task Started ===");

        try {
            learningReminderService.processStreakWarnings();
        } catch (Exception e) {
            log.error("Error occurred while processing streak warnings", e);
        }

        log.info("=== Streak Warning Task Completed ===");
    }

    /**
     * Optional: For testing purposes - runs every 5 minutes
     * Comment out or remove in production
     */
    // @Scheduled(cron = "0 */5 * * * *")
    // public void testLearningReminder() {
    //     log.info("Test: Sending learning reminders...");
    //     learningReminderService.processDailyReminders();
    // }

    /**
     * Optional: For testing streak warnings - runs every 10 minutes
     * Comment out or remove in production
     */
    // @Scheduled(cron = "0 */10 * * * *")
    // public void testStreakWarning() {
    //     log.info("Test: Sending streak warnings...");
    //     learningReminderService.processStreakWarnings();
    // }
}