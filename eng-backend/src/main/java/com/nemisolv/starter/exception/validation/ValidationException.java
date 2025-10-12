package com.nemisolv.starter.exception.validation;

import com.nemisolv.starter.exception.base.BaseApplicationException;
import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

/**
 * Base exception for validation errors
 */
@Getter
public class ValidationException extends BaseApplicationException {

    private final Map<String, String> fieldErrors;

    public ValidationException(String message) {
        super("VALIDATION_ERROR", message);
        this.fieldErrors = new HashMap<>();
    }

    public ValidationException(String message, Map<String, String> fieldErrors) {
        super("VALIDATION_ERROR", message);
        this.fieldErrors = fieldErrors != null ? fieldErrors : new HashMap<>();
    }

    public ValidationException(String field, String error) {
        super("VALIDATION_ERROR", String.format("Validation failed for field '%s': %s", field, error));
        this.fieldErrors = new HashMap<>();
        this.fieldErrors.put(field, error);
    }

    @Override
    public int getHttpStatus() {
        return 400; // Bad Request
    }
}
