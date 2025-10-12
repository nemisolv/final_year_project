package com.nemisolv.starter.notification;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public abstract class BaseEmailRequest {
    private String to;
    private String subject;
    private EmailType type;
    
    // Common fields for all email types
    private String userName;
    private String appName;
    private String supportEmail;
}
