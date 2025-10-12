package com.nemisolv.starter.repository;

import com.nemisolv.starter.entity.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CategoryRepository {

    @Qualifier("mariadbJdbcTemplate")
    private final JdbcTemplate jdbcTemplate;

    public Optional<Category> findById(Long id) {
        String sql = "SELECT * FROM categories WHERE id = ?";
        List<Category> categories = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Category.class), id);
        return categories.stream().findFirst();
    }

    public Optional<Category> findBySlug(String slug) {
        String sql = "SELECT * FROM categories WHERE slug = ?";
        List<Category> categories = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Category.class), slug);
        return categories.stream().findFirst();
    }

    public List<Category> findAllActive() {
        String sql = """
            SELECT * FROM categories
            WHERE is_active = 1
            ORDER BY sort_order ASC, name ASC
        """;
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Category.class));
    }

    public List<Category> findAll() {
        String sql = "SELECT * FROM categories ORDER BY sort_order ASC";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Category.class));
    }

    public int insert(Category category) {
        String sql = """
            INSERT INTO categories (name, slug, description, icon, color, sort_order, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        int rows = jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, category.getName());
            ps.setString(2, category.getSlug());
            ps.setString(3, category.getDescription());
            ps.setString(4, category.getIcon());
            ps.setString(5, category.getColor());
            ps.setObject(6, category.getSortOrder());
            ps.setObject(7, category.getIsActive());
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() != null) {
            category.setId(keyHolder.getKey().longValue());
        }

        return rows;
    }

    public int update(Category category) {
        String sql = """
            UPDATE categories SET
                name = ?,
                slug = ?,
                description = ?,
                icon = ?,
                color = ?,
                sort_order = ?,
                is_active = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """;
        return jdbcTemplate.update(sql,
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getIcon(),
                category.getColor(),
                category.getSortOrder(),
                category.getIsActive(),
                category.getId()
        );
    }

    public int deleteById(Long id) {
        String sql = "DELETE FROM categories WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }
}
