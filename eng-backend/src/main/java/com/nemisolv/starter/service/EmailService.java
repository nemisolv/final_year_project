package com.nemisolv.starter.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine emailTemplateEngine;
    
    @Value("${app.email.from:noreply@example.com}")
    private String defaultFromEmail;
    
    @Value("${app.email.reply-to:support@example.com}")
    private String defaultReplyTo;
    
    @Value("${app.name:English Learning Platform}")
    private String appName;
    

    public void sendEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setFrom(defaultFromEmail);
            helper.setReplyTo(defaultReplyTo);
            helper.setSubject(subject);
            
            // Prepare context for Thymeleaf template
            Context context = new Context();
            if (variables != null) {
                context.setVariables(variables);
            }
            
            // Add common variables
            context.setVariable("appName", appName);
            context.setVariable("supportEmail", defaultReplyTo);
            context.setVariable("currentYear", LocalDateTime.now().getYear());
            
            // Process template
            String htmlContent = emailTemplateEngine.process("email/" + templateName, context);
            helper.setText(htmlContent, true);
            
            // Send email
            mailSender.send(message);
            
            log.info("Email sent successfully to: {} with template: {}", to, templateName);
            
        } catch (MessagingException e) {
            log.error("Failed to send email to: {} with template: {}", to, templateName, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
    

    public void sendSimpleEmail(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setFrom(defaultFromEmail);
            helper.setReplyTo(defaultReplyTo);
            helper.setSubject(subject);
            helper.setText(content, false);
            
            // Send email
            mailSender.send(message);
            
            log.info("Simple email sent successfully to: {}", to);
            
        } catch (MessagingException e) {
            log.error("Failed to send simple email to: {}", to, e);
            throw new RuntimeException("Failed to send simple email", e);
        }
    }
}
