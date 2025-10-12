package com.nemisolv.starter.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {
    /**
     * Maximum number of requests allowed
     */
    int limit() default 5;

    /**
     * Time window in minutes
     */
    int duration() default 15;

    /**
     * Custom key prefix (optional)
     */
    String key() default "";
}
