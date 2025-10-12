package com.nemisolv.starter.enums;

import lombok.Getter;

public enum UserSkillLevel implements ValuableEnum {
BEGINNER("BEGINNER"),
    ELEMENTARY("ELEMENTARY"),
    INTERMEDIATE("INTERMEDIATE"),
    UPPER_INTERMEDIATE("UPPER_INTERMEDIATE"),
    ADVANCED("ADVANCED");

    private final String value;

    UserSkillLevel(String value) {
        this.value = value;
    }

    @Override
    public String getValue() {
        return value;
    }
}
