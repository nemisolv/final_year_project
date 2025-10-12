package com.nemisolv.starter.payload.course;

import com.nemisolv.starter.entity.Course;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    private String slug;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    private String thumbnail;

    private Long categoryId;

    @NotNull(message = "Difficulty level is required")
    private Course.DifficultyLevel difficultyLevel;

    @Min(value = 1, message = "Estimated duration must be at least 1 minute")
    private Integer estimatedDuration;

    private List<String> prerequisites;

    private List<String> learningObjectives;

    private List<String> tags;

    private Boolean isPublished;

    private Boolean isPremium;

    @DecimalMin(value = "0.0", inclusive = true, message = "Price must be >= 0")
    private BigDecimal price;
}
