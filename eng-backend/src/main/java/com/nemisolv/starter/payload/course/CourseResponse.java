package com.nemisolv.starter.payload.course;

import com.nemisolv.starter.entity.Course;
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
public class CourseResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private String title;
    private String slug;
    private String description;
    private String thumbnail;
    private Course.DifficultyLevel difficultyLevel;
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

    public static CourseResponse from(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .categoryId(course.getCategoryId())
                .categoryName(course.getCategoryName())
                .categorySlug(course.getCategorySlug())
                .title(course.getTitle())
                .slug(course.getSlug())
                .description(course.getDescription())
                .thumbnail(course.getThumbnail())
                .difficultyLevel(course.getDifficultyLevel())
                .estimatedDuration(course.getEstimatedDuration())
                .totalLessons(course.getTotalLessons())
                .totalExercises(course.getTotalExercises())
                .prerequisites(course.getPrerequisites())
                .learningObjectives(course.getLearningObjectives())
                .tags(course.getTags())
                .isPublished(course.getIsPublished())
                .isPremium(course.getIsPremium())
                .price(course.getPrice())
                .createdBy(course.getCreatedBy())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }
}
