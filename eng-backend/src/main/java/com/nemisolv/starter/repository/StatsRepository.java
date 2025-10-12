package com.nemisolv.starter.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class StatsRepository {

    @Qualifier("mariadbJdbcTemplate")
    private final JdbcTemplate jdbcTemplate;

    public long countPublishedLessons() {
        String sql = "SELECT COUNT(*) FROM lessons WHERE is_published = 1";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0L;
    }
    public long countPublishedCourses() {
        String sql = "SELECT COUNT(*) FROM courses WHERE is_published = 1";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0L;
    }

    public long countActiveUsers() {
        String sql = "SELECT COUNT(*) FROM users WHERE status = 'ACTIVE'";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0L;
    }


}