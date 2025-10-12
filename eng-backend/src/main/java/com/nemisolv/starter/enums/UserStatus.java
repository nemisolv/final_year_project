package com.nemisolv.starter.enums;

import lombok.Getter;

@Getter
public enum UserStatus implements ValuableEnum {
    ACTIVE("ACTIVE"), INACTIVE("INACTIVE"), SUSPENDED("SUSPENDED");
    private final String value;
    UserStatus(String value) {
        this.value = value;
    }


}
