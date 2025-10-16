package com.nemisolv.starter.controller;

import com.nemisolv.starter.payload.ApiResponse;
import com.nemisolv.starter.payload.PagedResponse;
import com.nemisolv.starter.payload.course.CourseRequest;
import com.nemisolv.starter.payload.course.CourseResponse;
import com.nemisolv.starter.payload.course.LessonRequest;
import com.nemisolv.starter.payload.course.LessonResponseDto;
import com.nemisolv.starter.service.CourseService;
import com.nemisolv.starter.service.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.nemisolv.starter.pagination.Pageable;
import com.nemisolv.starter.pagination.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final LessonService lessonService;

    @GetMapping
    public ApiResponse<PagedResponse<CourseResponse>> getAllCourses(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String difficultyLevel,
            @RequestParam(required = false) Boolean isPublished,
            @RequestParam(required = false) Boolean isPremium,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = Pageable.of(page, size, sort);

        PagedResponse<CourseResponse> courses = courseService.getAllCourses(
                categoryId, difficultyLevel, isPublished, isPremium, search, pageable
        );
        return ApiResponse.success(courses);
    }

    @GetMapping("/{id}")
    public ApiResponse<CourseResponse> getCourseById(@PathVariable Long id) {
        CourseResponse course = courseService.getCourseById(id);
        return ApiResponse.success(course);
    }

    @GetMapping("/slug/{slug}")
    public ApiResponse<CourseResponse> getCourseBySlug(@PathVariable String slug) {
        CourseResponse course = courseService.getCourseBySlug(slug);
        return ApiResponse.success(course);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ApiResponse<CourseResponse> createCourse(
            @Valid @RequestBody CourseRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long userId = Long.parseLong(jwt.getSubject());
        CourseResponse course = courseService.createCourse(request, userId);
        return ApiResponse.success(course);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ApiResponse<CourseResponse> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request
    ) {
        CourseResponse course = courseService.updateCourse(id, request);
        return ApiResponse.success(course);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ApiResponse.success(null);
    }

    // Lesson endpoints for a specific course
    @GetMapping("/{courseId}/lessons")
    public ApiResponse<List<LessonResponseDto>> getCourseLessons(
            @PathVariable Long courseId,
            @RequestParam(required = false) String lessonType,
            @RequestParam(required = false) Boolean isPublished
    ) {
        List<LessonResponseDto> lessons = lessonService.getLessonsByCourseId(courseId, lessonType, isPublished);
        return ApiResponse.success(lessons);
    }

    @GetMapping("/{courseId}/lessons/{lessonId}")
    public ApiResponse<LessonResponseDto> getLessonById(
            @PathVariable Long courseId,
            @PathVariable Long lessonId
    ) {
        LessonResponseDto lesson = lessonService.getLessonById(lessonId);
        return ApiResponse.success(lesson);
    }

    @GetMapping("/{courseId}/lessons/slug/{slug}")
    public ApiResponse<LessonResponseDto> getLessonBySlug(
            @PathVariable Long courseId,
            @PathVariable String slug
    ) {
        LessonResponseDto lesson = lessonService.getLessonBySlug(courseId, slug);
        return ApiResponse.success(lesson);
    }

    @PostMapping("/{courseId}/lessons")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ApiResponse<LessonResponseDto> createLesson(
            @PathVariable Long courseId,
            @Valid @RequestBody LessonRequest request
    ) {
        LessonResponseDto lesson = lessonService.createLesson(courseId, request);
        return ApiResponse.success(lesson);
    }

    @PutMapping("/{courseId}/lessons/{lessonId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ApiResponse<LessonResponseDto> updateLesson(
            @PathVariable Long courseId,
            @PathVariable Long lessonId,
            @Valid @RequestBody LessonRequest request
    ) {
        LessonResponseDto lesson = lessonService.updateLesson(lessonId, request);
        return ApiResponse.success(lesson);
    }

    @DeleteMapping("/{courseId}/lessons/{lessonId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteLesson(
            @PathVariable Long courseId,
            @PathVariable Long lessonId
    ) {
        lessonService.deleteLesson(lessonId);
        return ApiResponse.success(null);
    }
}
