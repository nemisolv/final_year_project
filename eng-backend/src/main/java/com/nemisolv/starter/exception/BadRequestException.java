package com.nemisolv.starter.exception;

import com.nemisolv.starter.enums.ApiResponseCode;
import com.nemisolv.starter.exception.base.ClientBaseException;
import com.nemisolv.starter.exception.base.ServerBaseException;
import org.springframework.http.HttpStatus;

/**
 * Exception for bad request errors
 * Always returns HTTP 400 Bad Request
 */
public class BadRequestException extends ClientBaseException {

    public BadRequestException(ApiResponseCode code) {
        super(code, HttpStatus.BAD_REQUEST);
    }

    public BadRequestException(ApiResponseCode code, String customMessage) {
        super(code, HttpStatus.BAD_REQUEST, customMessage);
    }

    public BadRequestException(ApiResponseCode code, Throwable cause) {
        super(code, HttpStatus.BAD_REQUEST, cause);
    }
}