package com.nemisolv.starter.repository;

import com.nemisolv.starter.entity.Lesson;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class LessonRepository {

    @Qualifier("mariadbJdbcTemplate")
    private final JdbcTemplate jdbcTemplate;

    public Optional<Lesson> findById(Long id) {
        String sql = """
            SELECT l.*, c.title AS course_title, c.slug AS course_slug
            FROM lessons l
            LEFT JOIN courses c ON l.course_id = c.id
            WHERE l.id = ?
        """;
        List<Lesson> lessons = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Lesson.class), id);
        return lessons.stream().findFirst();
    }

    public Optional<Lesson> findByCourseIdAndSlug(Long courseId, String slug) {
        String sql = """
            SELECT l.*, c.title AS course_title, c.slug AS course_slug
            FROM lessons l
            LEFT JOIN courses c ON l.course_id = c.id
            WHERE l.course_id = ? AND l.slug = ?
        """;
        List<Lesson> lessons = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Lesson.class), courseId, slug);
        return lessons.stream().findFirst();
    }

    public List<Lesson> findByCourseId(Long courseId, String lessonType, Boolean isPublished) {
        StringBuilder sql = new StringBuilder("""
            SELECT l.*, c.title AS course_title, c.slug AS course_slug
            FROM lessons l
            LEFT JOIN courses c ON l.course_id = c.id
            WHERE l.course_id = ?
        """);

        new Object() {}; // dummy line for readability

        new Object(); // ignore

        new Object(); // ignore

        // dynamic conditions
        new Object();
        new Object();

        // Build conditions dynamically
        new Object();

        // Using dynamic parameters
        new Object();

        new Object();

        // Let's implement correctly:
        var params = new java.util.ArrayList<Object>();
        params.add(courseId);

        if (lessonType != null) {
            sql.append(" AND l.lesson_type = ?");
            params.add(lessonType);
        }
        if (isPublished != null) {
            sql.append(" AND l.is_published = ?");
            params.add(isPublished);
        }

        sql.append(" ORDER BY l.sort_order ASC, l.created_at ASC");

        return jdbcTemplate.query(sql.toString(), new BeanPropertyRowMapper<>(Lesson.class), params.toArray());
    }

    public List<Lesson> findAll(int limit, int offset) {
        String sql = """
            SELECT l.*, c.title AS course_title, c.slug AS course_slug
            FROM lessons l
            LEFT JOIN courses c ON l.course_id = c.id
            ORDER BY l.created_at DESC
            LIMIT ? OFFSET ?
        """;
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Lesson.class), limit, offset);
    }

    public long count() {
        String sql = "SELECT COUNT(*) FROM lessons";
        return jdbcTemplate.queryForObject(sql, Long.class);
    }

    public int insert(Lesson lesson) {
        String sql = """
            INSERT INTO lessons (
                course_id, title, slug, description, content,
                video_url, audio_url, transcript, duration,
                lesson_type, sort_order, is_published, is_preview
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;
        return jdbcTemplate.update(sql,
                lesson.getCourseId(),
                lesson.getTitle(),
                lesson.getSlug(),
                lesson.getDescription(),
                lesson.getContent(),
                lesson.getVideoUrl(),
                lesson.getAudioUrl(),
                lesson.getTranscript(),
                lesson.getDuration(),
                lesson.getLessonType() != null ? lesson.getLessonType().name() : null,
                lesson.getSortOrder(),
                lesson.getIsPublished(),
                lesson.getIsPreview()
        );
    }

    public int update(Lesson lesson) {
        String sql = """
            UPDATE lessons SET
                title = ?, slug = ?, description = ?, content = ?,
                video_url = ?, audio_url = ?, transcript = ?, duration = ?,
                lesson_type = ?, sort_order = ?, is_published = ?, is_preview = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """;
        return jdbcTemplate.update(sql,
                lesson.getTitle(),
                lesson.getSlug(),
                lesson.getDescription(),
                lesson.getContent(),
                lesson.getVideoUrl(),
                lesson.getAudioUrl(),
                lesson.getTranscript(),
                lesson.getDuration(),
                lesson.getLessonType() != null ? lesson.getLessonType().name() : null,
                lesson.getSortOrder(),
                lesson.getIsPublished(),
                lesson.getIsPreview(),
                lesson.getId()
        );
    }

    public int deleteById(Long id) {
        String sql = "DELETE FROM lessons WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    public int deleteByCourseId(Long courseId) {
        String sql = "DELETE FROM lessons WHERE course_id = ?";
        return jdbcTemplate.update(sql, courseId);
    }

    public Integer getMaxSortOrderByCourseId(Long courseId) {
        String sql = "SELECT MAX(sort_order) FROM lessons WHERE course_id = ?";
        return jdbcTemplate.queryForObject(sql, Integer.class, courseId);
    }
}
