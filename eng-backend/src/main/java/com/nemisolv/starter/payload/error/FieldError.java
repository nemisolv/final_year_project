package com.nemisolv.starter.payload.error;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Represents a field-level validation error
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FieldError {

    /**
     * Name of the field that failed validation
     */
    private String field;

    /**
     * Error message describing the validation failure
     */
    private String message;

    /**
     * The rejected value (if applicable)
     */
    private Object rejectedValue;

    /**
     * The validation constraint that was violated
     */
    private String constraint;
}
