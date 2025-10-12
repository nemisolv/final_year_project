package com.nemisolv.starter.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class TimeUtil {
    private static final DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern(Constants.DATE_TIME_FORMAT);

    public static String format(LocalDateTime localDateTime) {
        return localDateTime.format(dateTimeFormatter);
    }
}
