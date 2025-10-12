package com.nemisolv.starter.repository;

import com.nemisolv.starter.entity.LearningStreak;
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
public class LearningStreakRepository {

    @Qualifier("namedParameterJdbcTemplate")
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public Optional<LearningStreak> findByUserIdAndDate(Long userId, LocalDate date) {
        String sql = "SELECT * FROM learning_streaks WHERE user_id = :userId AND date = :date";
        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        params.put("date", date);

        List<LearningStreak> results = namedParameterJdbcTemplate.query(sql, params, (rs, rowNum) ->
            LearningStreak.builder()
                .id(rs.getLong("id"))
                .userId(rs.getLong("user_id"))
                .date(rs.getDate("date").toLocalDate())
                .minutesStudied(rs.getInt("minutes_studied"))
                .lessonsCompleted(rs.getInt("lessons_completed"))
                .exercisesCompleted(rs.getInt("exercises_completed"))
                .xpEarned(rs.getInt("xp_earned"))
                .goalsMet(rs.getBoolean("goals_met"))
                .build()
        );

        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public void createInitialStreak(Long userId) {
        String sql = """
            INSERT INTO learning_streaks (user_id, date, minutes_studied, lessons_completed,
                                         exercises_completed, xp_earned, goals_met)
            VALUES (:userId, :date, 0, 0, 0, 0, 0)
        """;

        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        params.put("date", LocalDate.now());

        namedParameterJdbcTemplate.update(sql, params);
        log.info("Created initial learning streak for userId: {} on date: {}", userId, LocalDate.now());
    }
}