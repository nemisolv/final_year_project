package com.nemisolv.starter.notification;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class WelcomeEmailRequest extends BaseEmailRequest {
    private String loginLink;
    
    @Builder
    public WelcomeEmailRequest(String to, String userName, String loginLink) {
        super();
        setTo(to);
        setSubject("Welcome!");
        setType(EmailType.WELCOME);
        setUserName(userName);
        this.loginLink = loginLink;
    }
}
