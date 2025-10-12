package com.nemisolv.starter.payload.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Standard error response structure for all API errors
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    /**
     * Timestamp when error occurred
     */
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    /**
     * HTTP status code
     */
    private Integer status;

    /**
     * HTTP status reason phrase (Bad Request, Not Found, etc.)
     */
    private String error;

    /**
     * Error code for client-side handling (INVALID_CREDENTIALS, RESOURCE_NOT_FOUND, etc.)
     */
    private String code;

    /**
     * Human-readable error message
     */
    private String message;

    /**
     * API path where error occurred
     */
    private String path;

    /**
     * Unique request ID for tracking and debugging
     */
    private String requestId;

    /**
     * Detailed field-level validation errors (for validation failures)
     */
    private List<FieldError> errors;

    /**
     * Additional debug information (only in development mode)
     */
    private String debugMessage;

    /**
     * Stack trace (only in development mode)
     */
    private String stackTrace;
}
