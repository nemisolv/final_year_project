package com.nemisolv.starter.enums;

import lombok.Getter;

@Getter
public enum RoleName implements ValuableEnum{
   STUDENT("STUDENT"), ADMIN("ADMIN"), TEACHER("TEACHER");

    private final String value;

    RoleName(String value) {
        this.value = value;
    }
    
    @Override
    public String getValue() {
        return value;
    }
}
