package com.nemisolv.starter.exception.base;

import lombok.Getter;

/**
 * Base exception for all custom application exceptions
 * All custom exceptions should extend this class
 */
@Getter
public abstract class BaseApplicationException extends RuntimeException {

    private final String errorCode;
    private final Object[] args;

    protected BaseApplicationException(String message) {
        super(message);
        this.errorCode = this.getClass().getSimpleName();
        this.args = null;
    }

    protected BaseApplicationException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = this.getClass().getSimpleName();
        this.args = null;
    }

    protected BaseApplicationException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.args = null;
    }

    protected BaseApplicationException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.args = null;
    }

    protected BaseApplicationException(String errorCode, String message, Object... args) {
        super(message);
        this.errorCode = errorCode;
        this.args = args;
    }

    /**
     * Get HTTP status code for this exception
     * Default is 500 Internal Server Error
     */
    public abstract int getHttpStatus();
}
