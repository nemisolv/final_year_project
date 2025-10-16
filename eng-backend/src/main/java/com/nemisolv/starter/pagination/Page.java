package com.nemisolv.starter.pagination;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Custom Page implementation to replace Spring Data Page
 * Represents a page of data with pagination metadata
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Page<T> {

    /**
     * Content of the current page
     */
    @Builder.Default
    private List<T> content = Collections.emptyList();

    /**
     * Page number (0-indexed)
     */
    @Builder.Default
    private int page = 0;

    /**
     * Page size
     */
    @Builder.Default
    private int size = 10;

    /**
     * Total number of elements across all pages
     */
    @Builder.Default
    private long totalElements = 0;

    /**
     * Total number of pages
     */
    @Builder.Default
    private int totalPages = 0;

    /**
     * Is this the last page?
     */
    @Builder.Default
    private boolean last = true;

    /**
     * Is this the first page?
     */
    @Builder.Default
    private boolean first = true;

    /**
     * Number of elements in the current page
     */
    @Builder.Default
    private int numberOfElements = 0;

    /**
     * Is the page empty?
     */
    @Builder.Default
    private boolean empty = true;

    /**
     * Sort information
     */
    private Sort sort;

    /**
     * Create a Page from content, pageable, and total
     */
    public static <T> Page<T> of(List<T> content, Pageable pageable, long total) {
        int totalPages = pageable.getSize() == 0 ? 1 : (int) Math.ceil((double) total / (double) pageable.getSize());

        return Page.<T>builder()
            .content(content)
            .page(pageable.getPage())
            .size(pageable.getSize())
            .totalElements(total)
            .totalPages(totalPages)
            .numberOfElements(content.size())
            .empty(content.isEmpty())
            .first(pageable.getPage() == 0)
            .last(pageable.getPage() >= totalPages - 1)
            .sort(pageable.getSort())
            .build();
    }

    /**
     * Create an empty Page
     */
    public static <T> Page<T> empty() {
        return Page.<T>builder()
            .content(Collections.emptyList())
            .page(0)
            .size(0)
            .totalElements(0)
            .totalPages(0)
            .numberOfElements(0)
            .empty(true)
            .first(true)
            .last(true)
            .build();
    }

    /**
     * Create an empty Page with pageable
     */
    public static <T> Page<T> empty(Pageable pageable) {
        return Page.<T>builder()
            .content(Collections.emptyList())
            .page(pageable.getPage())
            .size(pageable.getSize())
            .totalElements(0)
            .totalPages(0)
            .numberOfElements(0)
            .empty(true)
            .first(true)
            .last(true)
            .sort(pageable.getSort())
            .build();
    }

    /**
     * Get the current page number (0-indexed)
     * JsonIgnore to avoid serialization conflict with 'page' field
     */
    @JsonIgnore
    public int getNumber() {
        return page;
    }

    /**
     * Check if there is a next page
     */
    @JsonIgnore
    public boolean hasNext() {
        return !last;
    }

    /**
     * Check if there is a previous page
     */
    @JsonIgnore
    public boolean hasPrevious() {
        return page > 0;
    }

    /**
     * Check if this is the first page
     */
    @JsonIgnore
    public boolean isFirst() {
        return first;
    }

    /**
     * Check if this is the last page
     */
    @JsonIgnore
    public boolean isLast() {
        return last;
    }

    /**
     * Map the content to another type
     */
    public <U> Page<U> map(Function<? super T, ? extends U> converter) {
        List<U> convertedContent = content.stream()
            .map(converter)
            .collect(Collectors.toList());

        return Page.<U>builder()
            .content(convertedContent)
            .page(page)
            .size(size)
            .totalElements(totalElements)
            .totalPages(totalPages)
            .numberOfElements(convertedContent.size())
            .empty(convertedContent.isEmpty())
            .first(first)
            .last(last)
            .sort(sort)
            .build();
    }

    // Getter methods are already provided by @Data annotation
    // No need to explicitly define them
}
