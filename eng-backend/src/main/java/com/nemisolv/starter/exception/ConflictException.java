package com.nemisolv.starter.exception;

import com.nemisolv.starter.enums.ApiResponseCode;
import com.nemisolv.starter.exception.base.ClientBaseException;
import org.springframework.http.HttpStatus;

/**
 * Exception được throw khi có conflict (409) - ví dụ: duplicate username, email, etc.
 */
public class ConflictException extends ClientBaseException {

    public ConflictException(String message) {
        super(ApiResponseCode.CONFLICT, HttpStatus.CONFLICT, message);
    }

    public ConflictException(String message, Throwable cause) {
        super(ApiResponseCode.CONFLICT, HttpStatus.CONFLICT, message, cause);
    }
}
