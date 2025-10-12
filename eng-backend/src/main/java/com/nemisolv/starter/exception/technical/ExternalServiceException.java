package com.nemisolv.starter.exception.technical;

import com.nemisolv.starter.exception.base.BaseApplicationException;

/**
 * Thrown when external service call fails (AI service, email service, etc.)
 */
public class ExternalServiceException extends BaseApplicationException {

    public ExternalServiceException(String serviceName, String message) {
        super("EXTERNAL_SERVICE_ERROR",
                String.format("External service '%s' error: %s", serviceName, message));
    }

    public ExternalServiceException(String serviceName, Throwable cause) {
        super("EXTERNAL_SERVICE_ERROR",
                String.format("Failed to call external service '%s'", serviceName), cause);
    }

    @Override
    public int getHttpStatus() {
        return 502; // Bad Gateway
    }
}
