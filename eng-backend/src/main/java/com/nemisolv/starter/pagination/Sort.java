package com.nemisolv.starter.pagination;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Custom Sort implementation to replace Spring Data Sort
 * Represents sorting information for queries
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Sort {

    @Builder.Default
    private List<Order> orders = new ArrayList<>();

    /**
     * Sort direction
     */
    public enum Direction {
        ASC, DESC;

        public static Direction fromString(String value) {
            try {
                return Direction.valueOf(value.toUpperCase());
            } catch (Exception e) {
                return ASC;
            }
        }
    }

    /**
     * Single sort order
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Order {
        private String property;

        @Builder.Default
        private Direction direction = Direction.ASC;

        public static Order by(String property) {
            return Order.builder().property(property).direction(Direction.ASC).build();
        }

        public static Order asc(String property) {
            return Order.builder().property(property).direction(Direction.ASC).build();
        }

        public static Order desc(String property) {
            return Order.builder().property(property).direction(Direction.DESC).build();
        }

        public boolean isAscending() {
            return direction == Direction.ASC;
        }

        public boolean isDescending() {
            return direction == Direction.DESC;
        }
    }

    /**
     * Create unsorted
     */
    public static Sort unsorted() {
        return Sort.builder().orders(new ArrayList<>()).build();
    }

    /**
     * Create sort by property ascending
     */
    public static Sort by(String... properties) {
        List<Order> orders = Arrays.stream(properties)
            .map(Order::by)
            .collect(Collectors.toList());
        return Sort.builder().orders(orders).build();
    }

    /**
     * Create sort by direction and properties
     */
    public static Sort by(Direction direction, String... properties) {
        List<Order> orders = Arrays.stream(properties)
            .map(prop -> Order.builder().property(prop).direction(direction).build())
            .collect(Collectors.toList());
        return Sort.builder().orders(orders).build();
    }

    /**
     * Create sort by orders
     */
    public static Sort by(Order... orders) {
        return Sort.builder().orders(Arrays.asList(orders)).build();
    }

    /**
     * Check if sorted
     */
    public boolean isSorted() {
        return orders != null && !orders.isEmpty();
    }

    /**
     * Check if unsorted
     */
    public boolean isUnsorted() {
        return !isSorted();
    }

    /**
     * And another sort
     */
    public Sort and(Sort sort) {
        if (sort == null || sort.isUnsorted()) {
            return this;
        }

        List<Order> combinedOrders = new ArrayList<>(this.orders);
        combinedOrders.addAll(sort.orders);
        return Sort.builder().orders(combinedOrders).build();
    }

    /**
     * Convert to SQL ORDER BY clause
     */
    public String toSql() {
        if (isUnsorted()) {
            return "";
        }

        return orders.stream()
            .map(order -> order.getProperty() + " " + order.getDirection().name())
            .collect(Collectors.joining(", "));
    }
}
