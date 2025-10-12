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
public class EmailVerificationRequest extends BaseEmailRequest {
    private String verificationLink;
    private String otpCode;

    @Builder
    public EmailVerificationRequest(String to, String userName, String verificationLink, String otpCode) {
        super();
        setTo(to);
        setSubject("Verify Your Email");
        setType(EmailType.EMAIL_VERIFICATION);
        setUserName(userName);
        this.verificationLink = verificationLink;
        this.otpCode = otpCode;
    }
}
