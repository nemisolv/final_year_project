package com.nemisolv.starter.payload.query;

public record SortOption(
    String sortBy,
    Direction direction
) {
    public enum Direction { ASC, DESC }
}