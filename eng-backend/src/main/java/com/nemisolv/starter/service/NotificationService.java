package com.nemisolv.starter.service;

import com.nemisolv.starter.notification.*;

import com.nemisolv.starter.util.Constants;
import com.nemisolv.starter.util.TimeUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService  {
    
    private final EmailService emailService;
    

    @Async
    public void sendEmail(BaseEmailRequest emailRequest) {
        try {
            String templateName = getTemplateName(emailRequest.getType());
            Map<String, Object> variables = buildTemplateVariables(emailRequest);
            
            emailService.sendEmail(
                emailRequest.getTo(),
                emailRequest.getSubject(),
                templateName,
                variables
            );
            
            log.info("Email sent successfully to: {} with type: {}", 
                emailRequest.getTo(), emailRequest.getType());
            
        } catch (Exception e) {
            log.error("Failed to send email to: {} with type: {}", 
                emailRequest.getTo(), emailRequest.getType(), e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
    
    private String getTemplateName(EmailType emailType) {
        return switch (emailType) {
            case EMAIL_VERIFICATION -> "email-verification";
            case PASSWORD_RESET -> "password-reset";
            case WELCOME -> "registration";
            case CUSTOM -> "default";
        };
    }
    
    private Map<String, Object> buildTemplateVariables(BaseEmailRequest emailRequest) {
        Map<String, Object> variables = new HashMap<>();
        
        // Common variables
        variables.put("userName", emailRequest.getUserName());
        variables.put("appName", emailRequest.getAppName());
        variables.put("supportEmail", emailRequest.getSupportEmail());
        
        // Type-specific variables
        if (emailRequest instanceof EmailVerificationRequest verificationRequest) {
            variables.put("verificationLink", verificationRequest.getVerificationLink());
            variables.put("otpCode", verificationRequest.getOtpCode());
            variables.put("expirationTime", TimeUtil.format(LocalDateTime.now().plusMinutes(3))); // From Constants - registration email expires in 3 minutes
        } else if (emailRequest instanceof PasswordResetEmailRequest resetRequest) {
            variables.put("resetLink", resetRequest.getResetLink());
            variables.put("expirationTime", TimeUtil.format(LocalDateTime.now().plusMinutes(3))); // From Constants - password reset expires in 3 minutes
        } else if (emailRequest instanceof WelcomeEmailRequest welcomeRequest) {
            variables.put("loginLink", welcomeRequest.getLoginLink());
        }
        
        return variables;
    }
}
