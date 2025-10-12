package com.nemisolv.starter.repository;

import com.nemisolv.starter.entity.UserStats;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Repository
@RequiredArgsConstructor
public class UserStatsRepository {

    @Qualifier("namedParameterJdbcTemplate")
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public Optional<UserStats> findByUserId(Long userId) {
        String sql = "SELECT * FROM user_stats WHERE user_id = :userId";
        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);

        List<UserStats> results = namedParameterJdbcTemplate.query(sql, params, (rs, rowNum) ->
            UserStats.builder()
                .id(rs.getLong("id"))
                .userId(rs.getLong("user_id"))
                .totalXp(rs.getInt("total_xp"))
                .currentLevel(rs.getInt("current_level"))
                .xpToNextLevel(rs.getInt("xp_to_next_level"))
                .totalStudyTime(rs.getInt("total_study_time"))
                .lessonsCompleted(rs.getInt("lessons_completed"))
                .exercisesCompleted(rs.getInt("exercises_completed"))
                .dialoguesCompleted(rs.getInt("dialogues_completed"))
                .currentStreakDays(rs.getInt("current_streak_days"))
                .longestStreakDays(rs.getInt("longest_streak_days"))
                .lastActivityDate(rs.getDate("last_activity_date") != null ?
                    rs.getDate("last_activity_date").toLocalDate() : null)
                .createdAt(rs.getTimestamp("created_at") != null ?
                    rs.getTimestamp("created_at").toLocalDateTime() : null)
                .updatedAt(rs.getTimestamp("updated_at") != null ?
                    rs.getTimestamp("updated_at").toLocalDateTime() : null)
                .build()
        );

        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public void createUserStats(Long userId) {
        String sql = """
            INSERT INTO user_stats (user_id, total_xp, current_level, xp_to_next_level,
                                   total_study_time, lessons_completed, exercises_completed,
                                   dialogues_completed, current_streak_days, longest_streak_days,
                                   last_activity_date)
            VALUES (:userId, 0, 1, 100, 0, 0, 0, 0, 1, 1, :lastActivityDate)
        """;

        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        params.put("lastActivityDate", LocalDate.now());

        namedParameterJdbcTemplate.update(sql, params);
        log.info("Created user_stats record for userId: {}", userId);
    }

    public void updateCurrentStreak(Long userId, int streakDays) {
        String sql = """
            UPDATE user_stats
            SET current_streak_days = :streakDays,
                longest_streak_days = GREATEST(longest_streak_days, :streakDays),
                last_activity_date = :lastActivityDate
            WHERE user_id = :userId
        """;

        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        params.put("streakDays", streakDays);
        params.put("lastActivityDate", LocalDate.now());

        namedParameterJdbcTemplate.update(sql, params);
        log.info("Updated streak for userId: {} to {} days", userId, streakDays);
    }
}