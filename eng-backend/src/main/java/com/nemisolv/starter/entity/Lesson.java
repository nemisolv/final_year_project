package com.nemisolv.starter.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Lesson {
    private Long id;
    private Long courseId;
    private String title;
    private String slug;
    private String description;
    private String content;
    private String videoUrl;
    private String audioUrl;
    private String transcript;
    private Integer duration;
    private LessonType lessonType;
    private Integer sortOrder;
    private Boolean isPublished;
    private Boolean isPreview;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Course details (for joined queries)
    private String courseTitle;
    private String courseSlug;

    public enum LessonType {
        VIDEO,
        AUDIO,
        TEXT,
        INTERACTIVE,
        QUIZ,
        EXERCISE
    }
}
