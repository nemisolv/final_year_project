package com.nemisolv.starter.service;

import com.nemisolv.starter.entity.Course;
import com.nemisolv.starter.exception.ResourceNotFoundException;
import com.nemisolv.starter.payload.course.CourseRequest;
import com.nemisolv.starter.payload.course.CourseResponse;
import com.nemisolv.starter.repository.CourseRepository;
import com.nemisolv.starter.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService {

    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public Page<CourseResponse> getAllCourses(Long categoryId, String difficultyLevel,
                                             Boolean isPublished, Boolean isPremium,
                                             String search, Pageable pageable) {
        int offset = pageable.getPageNumber() * pageable.getPageSize();
        List<Course> courses = courseRepository.findAll(
                categoryId, Course.DifficultyLevel.valueOf(difficultyLevel), isPublished, isPremium,
                search, pageable.getPageSize(), offset
        );

        long total = courseRepository.count(categoryId,  Course.DifficultyLevel.valueOf(difficultyLevel), isPublished, isPremium, search);

        List<CourseResponse> responses = courses.stream()
                .map(CourseResponse::from)
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, total);
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        return CourseResponse.from(course);
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseBySlug(String slug) {
        Course course = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with slug: " + slug));
        return CourseResponse.from(course);
    }

    @Transactional
    public CourseResponse createCourse(CourseRequest request, Long createdBy) {
        Course course = Course.builder()
                .categoryId(request.getCategoryId())
                .title(request.getTitle())
                .slug(generateSlug(request.getTitle(), request.getSlug()))
                .description(request.getDescription())
                .thumbnail(request.getThumbnail())
                .difficultyLevel(request.getDifficultyLevel())
                .estimatedDuration(request.getEstimatedDuration())
                .prerequisites(request.getPrerequisites())
                .learningObjectives(request.getLearningObjectives())
                .tags(request.getTags())
                .isPublished(request.getIsPublished() != null ? request.getIsPublished() : false)
                .isPremium(request.getIsPremium() != null ? request.getIsPremium() : false)
                .price(request.getPrice())
                .createdBy(createdBy)
                .build();

        courseRepository.insert(course);
        log.info("Created course with id: {}", course.getId());

        return getCourseById(course.getId());
    }

    @Transactional
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        Course existingCourse = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        existingCourse.setCategoryId(request.getCategoryId());
        existingCourse.setTitle(request.getTitle());
        existingCourse.setSlug(generateSlug(request.getTitle(), request.getSlug()));
        existingCourse.setDescription(request.getDescription());
        existingCourse.setThumbnail(request.getThumbnail());
        existingCourse.setDifficultyLevel(request.getDifficultyLevel());
        existingCourse.setEstimatedDuration(request.getEstimatedDuration());
        existingCourse.setPrerequisites(request.getPrerequisites());
        existingCourse.setLearningObjectives(request.getLearningObjectives());
        existingCourse.setTags(request.getTags());
        existingCourse.setIsPublished(request.getIsPublished());
        existingCourse.setIsPremium(request.getIsPremium());
        existingCourse.setPrice(request.getPrice());

        courseRepository.update(existingCourse);
        log.info("Updated course with id: {}", id);

        return getCourseById(id);
    }

    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        courseRepository.deleteById(id);
        log.info("Deleted course with id: {}", id);
    }

    @Transactional
    public void updateCourseCounts(Long courseId) {
        courseRepository.updateCourseCounts(courseId);
        log.info("Updated course counts for course id: {}", courseId);
    }

    private String generateSlug(String title, String providedSlug) {
        if (providedSlug != null && !providedSlug.isEmpty()) {
            return SlugUtil.slugify(providedSlug);
        }
        return SlugUtil.slugify(title);
    }
}
