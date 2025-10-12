package com.nemisolv.starter.exception.business;

import com.nemisolv.starter.exception.base.BaseApplicationException;

/**
 * Base exception for business logic violations
 * HTTP Status: 400 Bad Request (by default)
 */
public class BusinessException extends BaseApplicationException {

    public BusinessException(String message) {
        super(message);
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }

    public BusinessException(String errorCode, String message) {
        super(errorCode, message);
    }

    public BusinessException(String errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }

    @Override
    public int getHttpStatus() {
        return 400; // Bad Request
    }
}
