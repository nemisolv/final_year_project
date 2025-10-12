package com.nemisolv.starter.notification;

import lombok.Getter;

@Getter
public enum EmailType {
    EMAIL_VERIFICATION("email-verification", "Verify Your Email"),
    PASSWORD_RESET("password-reset", "Reset Your Password"),
    WELCOME("registration", "Welcome to Our Platform"),
    CUSTOM("default", "Notification");
    
    private final String templateName;
    private final String defaultSubject;
    
    EmailType(String templateName, String defaultSubject) {
        this.templateName = templateName;
        this.defaultSubject = defaultSubject;
    }

}
