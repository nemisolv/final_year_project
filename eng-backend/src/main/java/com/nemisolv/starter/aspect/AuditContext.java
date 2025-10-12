package com.nemisolv.starter.aspect;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Utility class to extract audit context information
 */
@Component
@Slf4j
public class AuditContext {
    
    /**
     * Get current user ID from security context
     */
    public Long getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
                Object userIdObj = jwt.getClaim("userId");
                return userIdObj instanceof Number ? ((Number) userIdObj).longValue() : null;
            }
        } catch (Exception e) {
            log.debug("Could not extract user ID from security context: {}", e.getMessage());
        }
        return null;
    }
    
    /**
     * Get current user email from security context
     */
    public String getCurrentUserEmail() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
                Object emailObj = jwt.getClaim("email");
                return emailObj != null ? emailObj.toString() : null;
            }
        } catch (Exception e) {
            log.debug("Could not extract user email from security context: {}", e.getMessage());
        }
        return null;
    }
    
    /**
     * Get current HTTP request
     */
    public HttpServletRequest getCurrentRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception e) {
            log.debug("Could not get current request: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Get client IP address from request
     */
    public String getClientIpAddress(HttpServletRequest request) {
        if (request == null) return null;
        
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
    
    /**
     * Get user agent from request
     */
    public String getUserAgent(HttpServletRequest request) {
        return request != null ? request.getHeader("User-Agent") : null;
    }
    
    /**
     * Get session ID from request
     */
    public String getSessionId(HttpServletRequest request) {
        return request != null && request.getSession() != null ? request.getSession().getId() : null;
    }
}
