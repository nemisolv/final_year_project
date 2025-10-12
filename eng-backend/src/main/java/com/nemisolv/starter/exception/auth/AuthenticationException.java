package com.nemisolv.starter.exception.auth;

import com.nemisolv.starter.enums.ApiResponseCode;
import com.nemisolv.starter.exception.base.ClientBaseException;
import com.nemisolv.starter.exception.base.ServerBaseException;
import org.springframework.http.HttpStatus;

/**
 * Exception for authentication-related errors
 * Always returns HTTP 401 Unauthorized
 */
public class AuthenticationException extends ClientBaseException {

    public AuthenticationException(ApiResponseCode code) {
        super(code, HttpStatus.UNAUTHORIZED);
    }

    public AuthenticationException(ApiResponseCode code, String customMessage) {
        super(code, HttpStatus.UNAUTHORIZED, customMessage);
    }

    public AuthenticationException(ApiResponseCode code, Throwable cause) {
        super(code, HttpStatus.UNAUTHORIZED, cause);
    }

}