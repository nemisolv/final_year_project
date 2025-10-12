package com.nemisolv.starter.enums;

import lombok.Getter;

@Getter
public enum AuthProvider implements ValuableEnum {
    LOCAL("LOCAL"),
    GOOGLE("GOOGLE"),
    MICROSOFT("MICROSOFT");

    private final String value;

    AuthProvider(String value) {
        this.value = value;
    }
}