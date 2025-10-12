package com.nemisolv.starter.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Course {
    private Long id;
    private Long categoryId;
    private String title;
    private String slug;
    private String description;
    private String thumbnail;
    private DifficultyLevel difficultyLevel;
    private Integer estimatedDuration;
    private Integer totalLessons;
    private Integer totalExercises;
    private List<String> prerequisites;
    private List<String> learningObjectives;
    private List<String> tags;
    private Boolean isPublished;
    private Boolean isPremium;
    private BigDecimal price;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Category details (for joined queries)
    private String categoryName;
    private String categorySlug;

    public enum DifficultyLevel {
        BEGINNER,
        ELEMENTARY,
        INTERMEDIATE,
        UPPER_INTERMEDIATE,
        ADVANCED,
        PROFICIENT
    }
}