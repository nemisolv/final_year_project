package com.nemisolv.starter.payload.course;

import com.nemisolv.starter.entity.Lesson;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonResponseDto {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private String courseSlug;
    private String title;
    private String slug;
    private String description;
    private String content;
    private String videoUrl;
    private String audioUrl;
    private String transcript;
    private Integer duration;
    private Lesson.LessonType lessonType;
    private Integer sortOrder;
    private Boolean isPublished;
    private Boolean isPreview;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static LessonResponseDto from(Lesson lesson) {
        return LessonResponseDto.builder()
                .id(lesson.getId())
                .courseId(lesson.getCourseId())
                .courseTitle(lesson.getCourseTitle())
                .courseSlug(lesson.getCourseSlug())
                .title(lesson.getTitle())
                .slug(lesson.getSlug())
                .description(lesson.getDescription())
                .content(lesson.getContent())
                .videoUrl(lesson.getVideoUrl())
                .audioUrl(lesson.getAudioUrl())
                .transcript(lesson.getTranscript())
                .duration(lesson.getDuration())
                .lessonType(lesson.getLessonType())
                .sortOrder(lesson.getSortOrder())
                .isPublished(lesson.getIsPublished())
                .isPreview(lesson.getIsPreview())
                .createdAt(lesson.getCreatedAt())
                .updatedAt(lesson.getUpdatedAt())
                .build();
    }
}
