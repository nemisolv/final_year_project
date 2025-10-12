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
public class PasswordResetEmailRequest extends BaseEmailRequest {
    private String resetLink;
    
    @Builder
    public PasswordResetEmailRequest(String to, String userName, String resetLink) {
        super();
        setTo(to);
        setSubject("Reset Your Password");
        setType(EmailType.PASSWORD_RESET);
        setUserName(userName);
        this.resetLink = resetLink;
    }
}
