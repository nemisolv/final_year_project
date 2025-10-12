package com.nemisolv.starter.exception;

import com.nemisolv.starter.enums.ApiResponseCode;
import com.nemisolv.starter.exception.base.ClientBaseException;
import com.nemisolv.starter.exception.base.ServerBaseException;
import org.springframework.http.HttpStatus;

/**
 * Exception for rate limit exceeded errors
 * Always returns HTTP 429 Too Many Requests
 */
public class RateLimitException extends ClientBaseException {

    public RateLimitException(ApiResponseCode code) {
        super(code, HttpStatus.TOO_MANY_REQUESTS);
    }

    public RateLimitException(ApiResponseCode code, String customMessage) {
        super(code, HttpStatus.TOO_MANY_REQUESTS, customMessage);
    }

    /**
     * Constructor with rate limit details
     */
    public RateLimitException(ApiResponseCode code, int limit, int durationMinutes) {
        super(code, HttpStatus.TOO_MANY_REQUESTS);
        this.withMetadata("limit", limit);
        this.withMetadata("duration", durationMinutes);
        this.withMetadata("retryAfter", durationMinutes * 60); // seconds
    }
}
