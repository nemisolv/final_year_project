package com.nemisolv.starter.exception;

import com.nemisolv.starter.enums.ApiResponseCode;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown when rate limit is exceeded
 * Extends RateLimitException with additional metadata support
 */
public class RateLimitExceededException extends RateLimitException {

    public RateLimitExceededException(String message, ApiResponseCode responseCode,
                                    int remainingAttempts, int retryAfterSeconds) {
        super(responseCode, message);
        this.withMetadata("remainingAttempts", remainingAttempts);
        this.withMetadata("retryAfter", retryAfterSeconds);
    }

    public RateLimitExceededException(String message, ApiResponseCode responseCode) {
        this(message, responseCode, 0, 900); // Default 15 minutes retry
    }

    public RateLimitExceededException(String message) {
        this(message, ApiResponseCode.RATE_LIMIT_EXCEEDED, 0, 900);
    }

    /**
     * Legacy getter for backward compatibility
     * @deprecated Use getMetadata().get("remainingAttempts") instead
     */
    @Deprecated
    public int getRemainingAttempts() {
        return (int) getMetadata().getOrDefault("remainingAttempts", 0);
    }

    /**
     * Legacy getter for backward compatibility
     * @deprecated Use getMetadata().get("retryAfter") instead
     */
    @Deprecated
    public int getRetryAfterSeconds() {
        return (int) getMetadata().getOrDefault("retryAfter", 900);
    }
}
