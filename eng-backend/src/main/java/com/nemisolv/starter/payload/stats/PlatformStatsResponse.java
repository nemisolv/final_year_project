package com.nemisolv.starter.payload.stats;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PlatformStatsResponse {
    private long lessonCount;
    private long courseCount;
    private long userCount;
}