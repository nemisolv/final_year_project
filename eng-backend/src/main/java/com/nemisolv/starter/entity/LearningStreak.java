package com.nemisolv.starter.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningStreak {
    private Long id;
    private Long userId;
    private LocalDate date;
    private Integer minutesStudied;
    private Integer lessonsCompleted;
    private Integer exercisesCompleted;
    private Integer xpEarned;
    private Boolean goalsMet;
}