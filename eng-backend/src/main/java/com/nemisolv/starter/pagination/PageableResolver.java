package com.nemisolv.starter.pagination;

import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Custom argument resolver for Pageable parameters
 * Resolves Pageable from request parameters
 */
@Component
public class PageableResolver implements HandlerMethodArgumentResolver {

    private static final String DEFAULT_PAGE_PARAMETER = "page";
    private static final String DEFAULT_SIZE_PARAMETER = "size";
    private static final String DEFAULT_LIMIT_PARAMETER = "limit";
    private static final String DEFAULT_SORT_PARAMETER = "sort";
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 100;

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return Pageable.class.equals(parameter.getParameterType());
    }

    @Override
    public Object resolveArgument(MethodParameter parameter,
                                 ModelAndViewContainer mavContainer,
                                 NativeWebRequest webRequest,
                                 WebDataBinderFactory binderFactory) {

        // Get page number from request (1-indexed from API)
        String pageString = webRequest.getParameter(DEFAULT_PAGE_PARAMETER);

        // Get page size from request (support both 'size' and 'limit')
        String sizeString = webRequest.getParameter(DEFAULT_SIZE_PARAMETER);
        if (sizeString == null) {
            sizeString = webRequest.getParameter(DEFAULT_LIMIT_PARAMETER);
        }

        // Check for @PageableDefault annotation FIRST
        PageableDefault pageableDefault = parameter.getParameterAnnotation(PageableDefault.class);

        // Determine page number (1-indexed from API)
        int page;
        if (pageString != null) {
            // User explicitly provided page number
            page = parseIntOrDefault(pageString, 1);
        } else if (pageableDefault != null) {
            // Use default from annotation (already 0-indexed, need to convert to 1-indexed for consistency)
            page = pageableDefault.page() + 1;
        } else {
            // Default to page 1
            page = 1;
        }

        // Convert from 1-indexed (API) to 0-indexed (internal)
        // API: page=1 is first page -> Internal: page=0
        if (page > 0) {
            page = page - 1;
        } else {
            page = 0; // Validate: negative or 0 becomes 0
        }

        // Determine page size
        int size;
        if (sizeString != null) {
            size = parseIntOrDefault(sizeString, DEFAULT_PAGE_SIZE);
        } else if (pageableDefault != null) {
            size = pageableDefault.size();
        } else {
            size = DEFAULT_PAGE_SIZE;
        }

        // Limit max page size
        if (size > MAX_PAGE_SIZE) {
            size = MAX_PAGE_SIZE;
        }
        if (size < 1) {
            size = DEFAULT_PAGE_SIZE;
        }

        // Get sort from request
        String[] sortParams = webRequest.getParameterValues(DEFAULT_SORT_PARAMETER);
        Sort sort = parseSort(sortParams, pageableDefault);

        return Pageable.builder()
            .page(page)
            .size(size)
            .sort(sort)
            .build();
    }

    /**
     * Parse sort from request parameters
     * Format: sort=property,direction (e.g., sort=name,asc or sort=createdAt,desc)
     */
    private Sort parseSort(String[] sortParams, PageableDefault pageableDefault) {
        if (sortParams != null && sortParams.length > 0) {
            List<Sort.Order> orders = Arrays.stream(sortParams)
                .map(this::parseSortOrder)
                .collect(Collectors.toList());
            return Sort.builder().orders(orders).build();
        }

        // Use default sort from annotation if present
        if (pageableDefault != null && pageableDefault.sort().length > 0) {
            List<Sort.Order> orders = Arrays.stream(pageableDefault.sort())
                .map(prop -> Sort.Order.builder()
                    .property(prop)
                    .direction(pageableDefault.direction())
                    .build())
                .collect(Collectors.toList());
            return Sort.builder().orders(orders).build();
        }

        return Sort.unsorted();
    }

    /**
     * Parse a single sort order from string
     * Format: "property,direction" or just "property" (defaults to ASC)
     */
    private Sort.Order parseSortOrder(String sortParam) {
        String[] parts = sortParam.split(",");
        String property = parts[0].trim();
        Sort.Direction direction = Sort.Direction.ASC;

        if (parts.length > 1) {
            direction = Sort.Direction.fromString(parts[1].trim());
        }

        return Sort.Order.builder()
            .property(property)
            .direction(direction)
            .build();
    }

    /**
     * Parse integer with default value
     */
    private int parseIntOrDefault(String value, int defaultValue) {
        if (value == null || value.trim().isEmpty()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}
