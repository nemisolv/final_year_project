package com.nemisolv.starter.exception;

import com.nemisolv.starter.enums.ApiResponseCode;
import com.nemisolv.starter.exception.base.ServerBaseException;
import org.springframework.http.HttpStatus;

/**
 * Exception for resource not found errors
 * Always returns HTTP 404 Not Found
 */
public class NotFoundException extends ServerBaseException {

    public NotFoundException(ApiResponseCode code) {
        super(code, HttpStatus.NOT_FOUND);
    }

    public NotFoundException(ApiResponseCode code, String customMessage) {
        super(code, HttpStatus.NOT_FOUND, customMessage);
    }

    /**
     * Constructor with resource type and ID metadata
     */
    public NotFoundException(ApiResponseCode code, String resourceType, Object resourceId) {
        super(code, HttpStatus.NOT_FOUND);
        this.withMetadata("resourceType", resourceType);
        this.withMetadata("resourceId", resourceId);
    }
}
