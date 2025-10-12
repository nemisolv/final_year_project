package com.nemisolv.starter.payload.course;

import com.nemisolv.starter.entity.Lesson;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    private String slug;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    private String content;

    private String videoUrl;

    private String audioUrl;

    private String transcript;

    @Min(value = 0, message = "Duration must be >= 0")
    private Integer duration;

    @NotNull(message = "Lesson type is required")
    private Lesson.LessonType lessonType;

    private Integer sortOrder;

    private Boolean isPublished;

    private Boolean isPreview;
}
