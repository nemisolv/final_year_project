package com.nemisolv.starter.exception.base;

import com.nemisolv.starter.enums.ApiResponseCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;

/**
 * Unified base exception for all application exceptions
 * Provides consistent structure with ApiResponseCode and HttpStatus integration
 *
 * Features:
 * - Self-contained (knows its HTTP status)
 * - Metadata support via fluent API
 * - Consistent with ApiResponse structure
 */
@Getter
public class ClientBaseException extends RuntimeException {

    private final ApiResponseCode responseCode;
    private final HttpStatus httpStatus;
    private final Map<String, Object> metadata;

    /**
     * Primary constructor with ApiResponseCode and HttpStatus
     */
    public ClientBaseException(ApiResponseCode responseCode, HttpStatus httpStatus) {
        super(responseCode.getMessage());
        this.responseCode = responseCode;
        this.httpStatus = httpStatus;
        this.metadata = new HashMap<>();
    }

    /**
     * Constructor with custom message override
     */
    public ClientBaseException(ApiResponseCode responseCode, HttpStatus httpStatus, String customMessage) {
        super(customMessage);
        this.responseCode = responseCode;
        this.httpStatus = httpStatus;
        this.metadata = new HashMap<>();
    }

    /**
     * Constructor with cause
     */
    public ClientBaseException(ApiResponseCode responseCode, HttpStatus httpStatus, Throwable cause) {
        super(responseCode.getMessage(), cause);
        this.responseCode = responseCode;
        this.httpStatus = httpStatus;
        this.metadata = new HashMap<>();
    }

    /**
     * Constructor with custom message and cause
     */
    public ClientBaseException(ApiResponseCode responseCode, HttpStatus httpStatus, String customMessage, Throwable cause) {
        super(customMessage, cause);
        this.responseCode = responseCode;
        this.httpStatus = httpStatus;
        this.metadata = new HashMap<>();
    }

    /**
     * Fluent API to add single metadata entry
     * @return this for method chaining
     */
    public ClientBaseException withMetadata(String key, Object value) {
        this.metadata.put(key, value);
        return this;
    }

    /**
     * Fluent API to add multiple metadata entries
     * @return this for method chaining
     */
    public ClientBaseException withMetadata(Map<String, Object> metadata) {
        this.metadata.putAll(metadata);
        return this;
    }

    /**
     * Get error code as integer
     */
    public int getCode() {
        return responseCode.getCode();
    }

    /**
     * Get error code message (default message from ApiResponseCode)
     */
    public String getCodeMessage() {
        return responseCode.getMessage();
    }

    /**
     * Check if this is a server error (5xx)
     */
    public boolean isServerError() {
        return httpStatus.is5xxServerError();
    }

    /**
     * Check if this is a client error (4xx)
     */
    public boolean isClientError() {
        return httpStatus.is4xxClientError();
    }
}