package com.nemisolv.starter.service;

import com.nemisolv.starter.entity.Lesson;
import com.nemisolv.starter.exception.ResourceNotFoundException;
import com.nemisolv.starter.payload.course.LessonRequest;
import com.nemisolv.starter.payload.course.LessonResponseDto;
import com.nemisolv.starter.repository.CourseRepository;
import com.nemisolv.starter.repository.LessonRepository;
import com.nemisolv.starter.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonService {

    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public List<LessonResponseDto> getLessonsByCourseId(Long courseId, String lessonType, Boolean isPublished) {
        // Verify course exists
        courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        List<Lesson> lessons = lessonRepository.findByCourseId(courseId, lessonType, isPublished);
        return lessons.stream()
                .map(LessonResponseDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LessonResponseDto getLessonById(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + id));
        return LessonResponseDto.from(lesson);
    }

    @Transactional(readOnly = true)
    public LessonResponseDto getLessonBySlug(Long courseId, String slug) {
        Lesson lesson = lessonRepository.findByCourseIdAndSlug(courseId, slug)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Lesson not found with slug: " + slug + " in course: " + courseId));
        return LessonResponseDto.from(lesson);
    }

    @Transactional
    public LessonResponseDto createLesson(Long courseId, LessonRequest request) {
        // Verify course exists
        courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        // Get next sort order if not provided
        Integer sortOrder = request.getSortOrder();
        if (sortOrder == null) {
            Integer maxOrder = lessonRepository.getMaxSortOrderByCourseId(courseId);
            sortOrder = (maxOrder != null ? maxOrder : 0) + 1;
        }

        Lesson lesson = Lesson.builder()
                .courseId(courseId)
                .title(request.getTitle())
                .slug(generateSlug(request.getTitle(), request.getSlug()))
                .description(request.getDescription())
                .content(request.getContent())
                .videoUrl(request.getVideoUrl())
                .audioUrl(request.getAudioUrl())
                .transcript(request.getTranscript())
                .duration(request.getDuration())
                .lessonType(request.getLessonType())
                .sortOrder(sortOrder)
                .isPublished(request.getIsPublished() != null ? request.getIsPublished() : false)
                .isPreview(request.getIsPreview() != null ? request.getIsPreview() : false)
                .build();

        lessonRepository.insert(lesson);
        log.info("Created lesson with id: {} for course: {}", lesson.getId(), courseId);

        // Update course lesson count
        courseRepository.updateCourseCounts(courseId);

        return getLessonById(lesson.getId());
    }

    @Transactional
    public LessonResponseDto updateLesson(Long id, LessonRequest request) {
        Lesson existingLesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + id));

        existingLesson.setTitle(request.getTitle());
        existingLesson.setSlug(generateSlug(request.getTitle(), request.getSlug()));
        existingLesson.setDescription(request.getDescription());
        existingLesson.setContent(request.getContent());
        existingLesson.setVideoUrl(request.getVideoUrl());
        existingLesson.setAudioUrl(request.getAudioUrl());
        existingLesson.setTranscript(request.getTranscript());
        existingLesson.setDuration(request.getDuration());
        existingLesson.setLessonType(request.getLessonType());
        if (request.getSortOrder() != null) {
            existingLesson.setSortOrder(request.getSortOrder());
        }
        existingLesson.setIsPublished(request.getIsPublished());
        existingLesson.setIsPreview(request.getIsPreview());

        lessonRepository.update(existingLesson);
        log.info("Updated lesson with id: {}", id);

        // Update course lesson count
        courseRepository.updateCourseCounts(existingLesson.getCourseId());

        return getLessonById(id);
    }

    @Transactional
    public void deleteLesson(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + id));

        Long courseId = lesson.getCourseId();
        lessonRepository.deleteById(id);
        log.info("Deleted lesson with id: {}", id);

        // Update course lesson count
        courseRepository.updateCourseCounts(courseId);
    }

    private String generateSlug(String title, String providedSlug) {
        if (providedSlug != null && !providedSlug.isEmpty()) {
            return SlugUtil.slugify(providedSlug);
        }
        return SlugUtil.slugify(title);
    }
}
