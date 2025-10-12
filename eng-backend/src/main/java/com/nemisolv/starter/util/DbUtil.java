package com.nemisolv.starter.util;

import java.sql.Timestamp;
import java.time.LocalDateTime;

public class DbUtil {
    public static LocalDateTime toLocalDatetime(Timestamp timestamp) {
        if (timestamp == null) {
            return null;
        }
        return timestamp.toLocalDateTime();
    }
}
