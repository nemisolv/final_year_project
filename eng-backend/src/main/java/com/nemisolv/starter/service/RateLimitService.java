package com.nemisolv.starter.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Implementation of RateLimitService using Redis
 * Prevents spam attacks by limiting requests per time window
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitService  {
    
    private final RedisTemplate<String, Object> redisTemplate;
    
    // Rate limit configuration
    private static final int MAX_LOGIN_ATTEMPTS_PER_IP = 10; // 10 attempts per window
    private static final int MAX_LOGIN_ATTEMPTS_PER_EMAIL = 5; // 5 attempts per window
    private static final int RATE_LIMIT_WINDOW_MINUTES = 15; // 15 minutes window
    
    // Redis key prefixes
    private static final String IP_RATE_LIMIT_PREFIX = "rate_limit:ip:";
    private static final String EMAIL_RATE_LIMIT_PREFIX = "rate_limit:email:";
    

    /**
     * Generic rate limiting method (increments counter)
     * @param key The unique key for rate limiting
     * @param limit Maximum number of requests allowed
     * @param durationMinutes Time window in minutes
     * @return true if rate limit exceeded, false otherwise
     */
    public boolean isRateLimited(String key, int limit, int durationMinutes) {
        if (key == null || key.isEmpty()) {
            return false;
        }

        try {
            Long currentAttempts = redisTemplate.opsForValue().increment(key);

            if (currentAttempts == 1) {
                redisTemplate.expire(key, durationMinutes, TimeUnit.MINUTES);
            }

            if (currentAttempts > limit) {
                log.warn("Rate limit exceeded for key: {} ({} requests in {} minutes)",
                        key, currentAttempts, durationMinutes);
                return true;
            }

            log.debug("Request for key: {} (attempt {}/{})", key, currentAttempts, limit);
            return false;
        } catch (Exception e) {
            log.error("Error checking rate limit for key: {}", key, e);
            return false; // Don't block on error
        }
    }

    /**
     * Check if already rate limited (without incrementing)
     * @param key The unique key for rate limiting
     * @param limit Maximum number of requests allowed
     * @return true if already rate limited, false otherwise
     */
    public boolean isAlreadyRateLimited(String key, int limit) {
        if (key == null || key.isEmpty()) {
            return false;
        }

        try {
            Integer currentAttempts = (Integer) redisTemplate.opsForValue().get(key);
            if (currentAttempts == null) {
                return false;
            }

            return currentAttempts >= limit;
        } catch (Exception e) {
            log.error("Error checking if already rate limited for key: {}", key, e);
            return false;
        }
    }

    /**
     * Increment rate limit counter
     */
    public void incrementRateLimit(String key, int durationMinutes) {
        if (key == null || key.isEmpty()) {
            return;
        }

        try {
            Long currentAttempts = redisTemplate.opsForValue().increment(key);

            if (currentAttempts == 1) {
                redisTemplate.expire(key, durationMinutes, TimeUnit.MINUTES);
            }

            log.debug("Incremented rate limit for key: {} (attempt: {})", key, currentAttempts);
        } catch (Exception e) {
            log.error("Error incrementing rate limit for key: {}", key, e);
        }
    }

    /**
     * Reset rate limit counter
     */
    public void resetRateLimit(String key) {
        if (key == null || key.isEmpty()) {
            return;
        }

        try {
            redisTemplate.delete(key);
            log.debug("Reset rate limit for key: {}", key);
        } catch (Exception e) {
            log.error("Error resetting rate limit for key: {}", key, e);
        }
    }
    

    public boolean isLoginAllowed(String ipAddress) {
        if (ipAddress == null || ipAddress.isEmpty()) {
            return true; // Allow if no IP (shouldn't happen in production)
        }
        
        String key = IP_RATE_LIMIT_PREFIX + ipAddress;
        
        try {
            // Use atomic INCR operation - this is already atomic in Redis
            Long currentAttempts = redisTemplate.opsForValue().increment(key);
            
            // Set expiration only on first increment (when value becomes 1)
            if (currentAttempts == 1) {
                redisTemplate.expire(key, RATE_LIMIT_WINDOW_MINUTES, TimeUnit.MINUTES);
            }
            
            // Check if limit exceeded
            if (currentAttempts > MAX_LOGIN_ATTEMPTS_PER_IP) {
                log.warn("Rate limit exceeded for IP: {} ({} attempts in {} minutes)", 
                        ipAddress, currentAttempts, RATE_LIMIT_WINDOW_MINUTES);
                return false;
            }
            
            log.debug("Login attempt for IP: {} (attempt {}/{})", 
                    ipAddress, currentAttempts, MAX_LOGIN_ATTEMPTS_PER_IP);
            
            return true;
        } catch (Exception e) {
            log.error("Error checking rate limit for IP: {}", ipAddress, e);
            return true; // Allow on error to avoid blocking legitimate users
        }
    }
    

    public boolean isLoginAllowedForEmail(String email) {
        if (email == null || email.isEmpty()) {
            return true; // Allow if no email
        }
        
        String normalizedEmail = email.toLowerCase().trim();
        String key = EMAIL_RATE_LIMIT_PREFIX + normalizedEmail;
        
        try {
            // Use atomic INCR operation - this is already atomic in Redis
            Long currentAttempts = redisTemplate.opsForValue().increment(key);
            
            // Set expiration only on first increment (when value becomes 1)
            if (currentAttempts == 1) {
                redisTemplate.expire(key, RATE_LIMIT_WINDOW_MINUTES, TimeUnit.MINUTES);
            }
            
            // Check if limit exceeded
            if (currentAttempts > MAX_LOGIN_ATTEMPTS_PER_EMAIL) {
                log.warn("Rate limit exceeded for email: {} ({} attempts in {} minutes)", 
                        normalizedEmail, currentAttempts, RATE_LIMIT_WINDOW_MINUTES);
                return false;
            }
            
            log.debug("Login attempt for email: {} (attempt {}/{})", 
                    normalizedEmail, currentAttempts, MAX_LOGIN_ATTEMPTS_PER_EMAIL);
            
            return true;
        } catch (Exception e) {
            log.error("Error checking rate limit for email: {}", normalizedEmail, e);
            return true; // Allow on error to avoid blocking legitimate users
        }
    }
    

    public int getRemainingAttempts(String ipAddress) {
        if (ipAddress == null || ipAddress.isEmpty()) {
            return MAX_LOGIN_ATTEMPTS_PER_IP;
        }
        
        String key = IP_RATE_LIMIT_PREFIX + ipAddress;
        
        try {
            Integer attempts = (Integer) redisTemplate.opsForValue().get(key);
            if (attempts == null) {
                return MAX_LOGIN_ATTEMPTS_PER_IP;
            }
            
            return Math.max(0, MAX_LOGIN_ATTEMPTS_PER_IP - attempts);
        } catch (Exception e) {
            log.error("Error getting remaining attempts for IP: {}", ipAddress, e);
            return MAX_LOGIN_ATTEMPTS_PER_IP; // Return max on error
        }
    }
    

    public int getRemainingAttemptsForEmail(String email) {
        if (email == null || email.isEmpty()) {
            return MAX_LOGIN_ATTEMPTS_PER_EMAIL;
        }
        
        String normalizedEmail = email.toLowerCase().trim();
        String key = EMAIL_RATE_LIMIT_PREFIX + normalizedEmail;
        
        try {
            Integer attempts = (Integer) redisTemplate.opsForValue().get(key);
            if (attempts == null) {
                return MAX_LOGIN_ATTEMPTS_PER_EMAIL;
            }
            
            return Math.max(0, MAX_LOGIN_ATTEMPTS_PER_EMAIL - attempts);
        } catch (Exception e) {
            log.error("Error getting remaining attempts for email: {}", normalizedEmail, e);
            return MAX_LOGIN_ATTEMPTS_PER_EMAIL; // Return max on error
        }
    }


    public void resetLoginAttempts(String ipAddress) {
        if (ipAddress == null || ipAddress.isEmpty()) {
            return;
        }

        String key = IP_RATE_LIMIT_PREFIX + ipAddress;

        try {
            redisTemplate.delete(key);
            log.debug("Reset login attempts for IP: {}", ipAddress);
        } catch (Exception e) {
            log.error("Error resetting login attempts for IP: {}", ipAddress, e);
        }
    }


    public void resetLoginAttemptsForEmail(String email) {
        if (email == null || email.isEmpty()) {
            return;
        }

        String normalizedEmail = email.toLowerCase().trim();
        String key = EMAIL_RATE_LIMIT_PREFIX + normalizedEmail;

        try {
            redisTemplate.delete(key);
            log.debug("Reset login attempts for email: {}", normalizedEmail);
        } catch (Exception e) {
            log.error("Error resetting login attempts for email: {}", normalizedEmail, e);
        }
    }
}
