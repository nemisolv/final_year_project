package com.nemisolv.starter.exception.technical;

import com.nemisolv.starter.exception.base.BaseApplicationException;

/**
 * Thrown when database operation fails
 */
public class DatabaseException extends BaseApplicationException {

    public DatabaseException(String message) {
        super("DATABASE_ERROR", message);
    }

    public DatabaseException(String message, Throwable cause) {
        super("DATABASE_ERROR", message, cause);
    }

    @Override
    public int getHttpStatus() {
        return 500; // Internal Server Error
    }
}
