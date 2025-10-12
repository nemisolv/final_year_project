package com.nemisolv.starter.exception.business;

/**
 * Thrown when an operation cannot be performed due to business rules
 * Example: Cannot delete a user with active subscriptions
 */
public class InvalidOperationException extends BusinessException {

    public InvalidOperationException(String message) {
        super("INVALID_OPERATION", message);
    }

    public InvalidOperationException(String message, Throwable cause) {
        super("INVALID_OPERATION", message, cause);
    }
}
