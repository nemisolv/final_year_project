package com.nemisolv.starter.pagination;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Custom Pageable implementation to replace Spring Data Pageable
 * Represents pagination information for queries
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pageable {

    /**
     * Page number (0-indexed)
     */
    @Builder.Default
    private int page = 1;

    /**
     * Number of items per page
     */
    @Builder.Default
    private int size = 10;

    /**
     * Sort criteria
     */
    private Sort sort;

    /**
     * Get the offset (number of items to skip)
     */
    public int getOffset() {
        return ( page-1 ) * size;
    }

    /**
     * Get page number (0-indexed for internal use)
     */
    public int getPageNumber() {
        return page;
    }

    /**
     * Get page size
     */
    public int getPageSize() {
        return size;
    }

    /**
     * Check if there is a previous page
     */
    public boolean hasPrevious() {
        return page > 0;
    }

    /**
     * Get the previous pageable
     */
    public Pageable previousOrFirst() {
        return hasPrevious()
            ? Pageable.builder().page(page - 1).size(size).sort(sort).build()
            : this;
    }

    public void setPage(int page) {
        if(page < 1) {
            page = 1;
        }
        this.page = page;
    }

    /**
     * Get the next pageable
     */
    public Pageable next() {
        return Pageable.builder().page(page + 1).size(size).sort(sort).build();
    }

    /**
     * Create a pageable for the first page
     */
    public static Pageable first(int size) {
        return Pageable.builder().page(0).size(size).build();
    }

    /**
     * Create an unpaged pageable (all results)
     */
    public static Pageable unpaged() {
        return Pageable.builder().page(0).size(Integer.MAX_VALUE).build();
    }

    /**
     * Create a pageable with sort
     */
    public static Pageable of(int page, int size, Sort sort) {
        return Pageable.builder().page(page).size(size).sort(sort).build();
    }

    /**
     * Create a pageable without sort
     */
    public static Pageable of(int page, int size) {
        return Pageable.builder().page(page).size(size).build();
    }
}
