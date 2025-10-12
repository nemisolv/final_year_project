package com.nemisolv.starter.enums;


public enum MailType implements ValuableEnum {
    REGISTRATION_CONFIRMATION("REGISTRATION_CONFIRMATION"),
    PASSWORD_RESET("PASSWORD_RESET"),
    FORGOT_PASSWORD("FORGOT_PASSWORD");
    private final String value;
    MailType(String value) {
        this.value = value;
    }

    @Override
    public String getValue() {
        return value;
    }

}
