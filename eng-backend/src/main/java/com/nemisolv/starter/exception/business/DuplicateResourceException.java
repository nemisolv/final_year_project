package com.nemisolv.starter.exception.business;

/**
 * Thrown when attempting to create a resource that already exists
 * Example: Registering with an email that's already taken
 */
public class DuplicateResourceException extends BusinessException {

    public DuplicateResourceException(String message) {
        super("DUPLICATE_RESOURCE", message);
    }

    public DuplicateResourceException(String resourceName, String fieldName, Object fieldValue) {
        super("DUPLICATE_RESOURCE",
                String.format("%s already exists with %s: %s", resourceName, fieldName, fieldValue));
    }

    @Override
    public int getHttpStatus() {
        return 409; // Conflict
    }
}
