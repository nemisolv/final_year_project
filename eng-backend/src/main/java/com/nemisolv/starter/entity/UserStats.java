package com.nemisolv.starter.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStats {
    private Long id;
    private Long userId;
    private Integer totalXp;
    private Integer currentLevel;
    private Integer xpToNextLevel;
    private Integer totalStudyTime;
    private Integer lessonsCompleted;
    private Integer exercisesCompleted;
    private Integer dialoguesCompleted;
    private Integer currentStreakDays;
    private Integer longestStreakDays;
    private LocalDate lastActivityDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}