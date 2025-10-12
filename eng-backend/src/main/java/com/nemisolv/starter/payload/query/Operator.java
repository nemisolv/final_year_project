package com.nemisolv.starter.payload.query;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Operator {
    EQUALS("="),
    NOT_EQUALS("!="),
    GREATER_THAN(">"),
    LESS_THAN("<"),
    LIKE("LIKE"),
    IN("IN");

    private final String sqlOperator;
}