package com.nemisolv.starter.aspect;

import com.nemisolv.starter.annotation.RateLimit;
import com.nemisolv.starter.enums.ApiResponseCode;
import com.nemisolv.starter.exception.RateLimitException;
import com.nemisolv.starter.exception.base.ClientBaseException;
import com.nemisolv.starter.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

/**
 * Aspect for handling rate limiting on annotated methods
 * Uses Redis-based rate limiting service to track and enforce request limits
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitAspect {

    private final RateLimitService rateLimitService;
    private final HttpServletRequest request;

    @Around("@annotation(rateLimit)")
    public Object handleRateLimit(ProceedingJoinPoint joinPoint, RateLimit rateLimit) throws Throwable {
        String clientIp = getClientIpAddress();
        String key = rateLimit.key() + ":" + clientIp;

        // Check if rate limit already exceeded
        if (rateLimitService.isAlreadyRateLimited(key, rateLimit.limit())) {
            log.warn("Rate limit exceeded for key: {}, IP: {}", rateLimit.key(), clientIp);
            throw new RateLimitException(
                ApiResponseCode.RATE_LIMIT_EXCEEDED,
                rateLimit.limit(),
                rateLimit.duration()
            );
        }

        try {
            // Execute the method
            Object result = joinPoint.proceed();

            // Reset rate limit on successful execution
            rateLimitService.resetRateLimit(key);
            return result;

        } catch (ClientBaseException ex) {
            // Increment rate limit counter for client errors
            rateLimitService.incrementRateLimit(key, rateLimit.duration());
            log.debug("Incremented rate limit for key: {} due to client error: {}", key, ex.getMessage());
            throw ex;
        }
    }

    /**
     * Extract client IP address from request headers with fallback
     */
    private String getClientIpAddress() {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip != null ? ip : "unknown";
    }
}
