package com.nemisolv.starter.service;

import com.nemisolv.starter.payload.stats.PlatformStatsResponse;
import com.nemisolv.starter.repository.StatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final StatsRepository statsRepository;

    @Transactional(readOnly = true)
    public PlatformStatsResponse getPlatformStats() {
        long lessonCount = statsRepository.countPublishedLessons();
        long userCount = statsRepository.countActiveUsers();
        long courseCount = statsRepository.countPublishedCourses();

        return PlatformStatsResponse.builder()
            .lessonCount(lessonCount)
            .courseCount(courseCount)
            .userCount(userCount)
            .build();
    }
}