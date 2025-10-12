package com.nemisolv.starter.scheduled;

import com.nemisolv.starter.service.BirthdayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled task to check for users' birthdays and send birthday wishes
 * Runs every day at 9:00 AM
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class BirthdayScheduledTask {

    private final BirthdayService birthdayService;

    /**
     * Check for birthdays and send wishes
     * Runs every day at 9:00 AM (server time)
     *
     * Cron expression: "0 0 9 * * *"
     * - Second: 0
     * - Minute: 0
     * - Hour: 9
     * - Day of month: *
     * - Month: *
     * - Day of week: *
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void checkBirthdaysAndSendWishes() {
        log.info("=== Birthday Check Scheduled Task Started ===");

        try {
            birthdayService.processBirthdayNotifications();
        } catch (Exception e) {
            log.error("Error occurred while processing birthday notifications", e);
        }

        log.info("=== Birthday Check Scheduled Task Completed ===");
    }

    /**
     * Optional: For testing purposes - runs every minute
     * Comment out or remove in production
     */
    // @Scheduled(cron = "0 * * * * *")
    // public void testBirthdayCheck() {
    //     log.info("Test: Checking birthdays...");
    //     birthdayService.processBirthdayNotifications();
    // }
}