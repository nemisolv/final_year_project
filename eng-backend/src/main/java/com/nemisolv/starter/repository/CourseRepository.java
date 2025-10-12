package com.nemisolv.starter.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nemisolv.starter.entity.Course;
import com.nemisolv.starter.entity.Course.DifficultyLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Repository
public class CourseRepository {

    @Qualifier("mariadbJdbcTemplate")
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ------------------------------
    // Find by ID
    // ------------------------------
    public Optional<Course> findById(Long id) {
        String sql = """
            SELECT c.*, cat.name as category_name, cat.slug as category_slug
            FROM courses c
            LEFT JOIN categories cat ON c.category_id = cat.id
            WHERE c.id = ?
        """;
        List<Course> list = jdbcTemplate.query(sql, this::mapRowToCourse, id);
        return list.stream().findFirst();
    }

    // ------------------------------
    // Find by slug
    // ------------------------------
    public Optional<Course> findBySlug(String slug) {
        String sql = """
            SELECT c.*, cat.name as category_name, cat.slug as category_slug
            FROM courses c
            LEFT JOIN categories cat ON c.category_id = cat.id
            WHERE c.slug = ?
        """;
        List<Course> list = jdbcTemplate.query(sql, this::mapRowToCourse, slug);
        return list.stream().findFirst();
    }

    // ------------------------------
    // Find all (dynamic filtering)
    // ------------------------------
    public List<Course> findAll(Long categoryId,
                                DifficultyLevel difficultyLevel,
                                Boolean isPublished,
                                Boolean isPremium,
                                String search,
                                int limit,
                                int offset) {

        StringBuilder sql = new StringBuilder("""
            SELECT c.*, cat.name as category_name, cat.slug as category_slug
            FROM courses c
            LEFT JOIN categories cat ON c.category_id = cat.id
            WHERE 1=1
        """);

        List<Object> params = new ArrayList<>();

        if (categoryId != null) {
            sql.append(" AND c.category_id = ?");
            params.add(categoryId);
        }
        if (difficultyLevel != null) {
            sql.append(" AND c.difficulty_level = ?");
            params.add(difficultyLevel.name());
        }
        if (isPublished != null) {
            sql.append(" AND c.is_published = ?");
            params.add(isPublished);
        }
        if (isPremium != null) {
            sql.append(" AND c.is_premium = ?");
            params.add(isPremium);
        }
        if (search != null && !search.isBlank()) {
            sql.append(" AND (c.title LIKE ? OR c.description LIKE ?)");
            params.add("%" + search + "%");
            params.add("%" + search + "%");
        }

        sql.append(" ORDER BY c.created_at DESC LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);

        return jdbcTemplate.query(sql.toString(), this::mapRowToCourse, params.toArray());
    }

    // ------------------------------
    // Count (with same filters)
    // ------------------------------
    public long count(Long categoryId,
                      DifficultyLevel difficultyLevel,
                      Boolean isPublished,
                      Boolean isPremium,
                      String search) {

        StringBuilder sql = new StringBuilder("""
            SELECT COUNT(*) FROM courses c WHERE 1=1
        """);

        List<Object> params = new ArrayList<>();

        if (categoryId != null) {
            sql.append(" AND c.category_id = ?");
            params.add(categoryId);
        }
        if (difficultyLevel != null) {
            sql.append(" AND c.difficulty_level = ?");
            params.add(difficultyLevel.name());
        }
        if (isPublished != null) {
            sql.append(" AND c.is_published = ?");
            params.add(isPublished);
        }
        if (isPremium != null) {
            sql.append(" AND c.is_premium = ?");
            params.add(isPremium);
        }
        if (search != null && !search.isBlank()) {
            sql.append(" AND (c.title LIKE ? OR c.description LIKE ?)");
            params.add("%" + search + "%");
            params.add("%" + search + "%");
        }

        return jdbcTemplate.queryForObject(sql.toString(), Long.class, params.toArray());
    }

    // ------------------------------
    // Insert
    // ------------------------------
    public int insert(Course course) {
        String sql = """
            INSERT INTO courses (
                category_id, title, slug, description, thumbnail,
                difficulty_level, estimated_duration, prerequisites,
                learning_objectives, tags, is_published, is_premium,
                price, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(conn -> {
            PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setObject(1, course.getCategoryId());
            ps.setString(2, course.getTitle());
            ps.setString(3, course.getSlug());
            ps.setString(4, course.getDescription());
            ps.setString(5, course.getThumbnail());
            ps.setString(6, course.getDifficultyLevel() != null ? course.getDifficultyLevel().name() : null);
            ps.setObject(7, course.getEstimatedDuration());
            ps.setString(8, toJson(course.getPrerequisites()));
            ps.setString(9, toJson(course.getLearningObjectives()));
            ps.setString(10, toJson(course.getTags()));
            ps.setObject(11, course.getIsPublished());
            ps.setObject(12, course.getIsPremium());
            ps.setBigDecimal(13, course.getPrice());
            ps.setObject(14, course.getCreatedBy());
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() != null) {
            course.setId(keyHolder.getKey().longValue());
        }

        return 1;
    }

    // ------------------------------
    // Update
    // ------------------------------
    public int update(Course course) {
        String sql = """
            UPDATE courses SET
                category_id = ?, title = ?, slug = ?, description = ?, thumbnail = ?,
                difficulty_level = ?, estimated_duration = ?, prerequisites = ?,
                learning_objectives = ?, tags = ?, is_published = ?, is_premium = ?,
                price = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """;

        return jdbcTemplate.update(sql,
                course.getCategoryId(),
                course.getTitle(),
                course.getSlug(),
                course.getDescription(),
                course.getThumbnail(),
                course.getDifficultyLevel() != null ? course.getDifficultyLevel().name() : null,
                course.getEstimatedDuration(),
                toJson(course.getPrerequisites()),
                toJson(course.getLearningObjectives()),
                toJson(course.getTags()),
                course.getIsPublished(),
                course.getIsPremium(),
                course.getPrice(),
                course.getId()
        );
    }

    // ------------------------------
    // Delete
    // ------------------------------
    public int deleteById(Long id) {
        return jdbcTemplate.update("DELETE FROM courses WHERE id = ?", id);
    }

    // ------------------------------
    // Update counts
    // ------------------------------
    public void updateCourseCounts(Long courseId) {
        String sql = """
            UPDATE courses
            SET total_lessons = (SELECT COUNT(*) FROM lessons WHERE course_id = ? AND is_published = 1),
                total_exercises = (SELECT COUNT(*) FROM exercises e
                                   INNER JOIN lessons l ON e.lesson_id = l.id
                                   WHERE l.course_id = ?)
            WHERE id = ?
        """;
        jdbcTemplate.update(sql, courseId, courseId, courseId);
    }

    // ------------------------------
    // Helpers
    // ------------------------------
    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "[]";
        }
    }

    private Course mapRowToCourse(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        Course c = new Course();
        c.setId(rs.getLong("id"));
        c.setCategoryId(rs.getLong("category_id"));
        c.setTitle(rs.getString("title"));
        c.setSlug(rs.getString("slug"));
        c.setDescription(rs.getString("description"));
        c.setThumbnail(rs.getString("thumbnail"));
        String level = rs.getString("difficulty_level");
        if (level != null) {
            c.setDifficultyLevel(DifficultyLevel.valueOf(level));
        }
        c.setEstimatedDuration(rs.getObject("estimated_duration", Integer.class));
        c.setTotalLessons(rs.getObject("total_lessons", Integer.class));
        c.setTotalExercises(rs.getObject("total_exercises", Integer.class));
        c.setIsPublished(rs.getBoolean("is_published"));
        c.setIsPremium(rs.getBoolean("is_premium"));
        c.setPrice(rs.getBigDecimal("price"));
        c.setCreatedBy(rs.getObject("created_by", Long.class));
        c.setCreatedAt(rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toLocalDateTime() : null);
        c.setUpdatedAt(rs.getTimestamp("updated_at") != null ? rs.getTimestamp("updated_at").toLocalDateTime() : null);
        c.setCategoryName(rs.getString("category_name"));
        c.setCategorySlug(rs.getString("category_slug"));

        try {
            c.setPrerequisites(objectMapper.readValue(rs.getString("prerequisites"), new TypeReference<>() {}));
            c.setLearningObjectives(objectMapper.readValue(rs.getString("learning_objectives"), new TypeReference<>() {}));
            c.setTags(objectMapper.readValue(rs.getString("tags"), new TypeReference<>() {}));
        } catch (Exception e) {
            c.setPrerequisites(List.of());
            c.setLearningObjectives(List.of());
            c.setTags(List.of());
        }
        return c;
    }
}
