package com.nemisolv.starter.pagination;

import java.lang.annotation.*;

/**
 * Annotation to specify default values for Pageable parameters
 * Replaces Spring Data's @PageableDefault
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface PageableDefault {

    /**
     * Default page number (1-indexed)
     */
    int page() default 1;

    /**
     * Default page size
     */
    int size() default 10;

    /**
     * Default sort properties
     */
    String[] sort() default {};

    /**
     * Default sort direction
     */
    Sort.Direction direction() default Sort.Direction.ASC;
}
