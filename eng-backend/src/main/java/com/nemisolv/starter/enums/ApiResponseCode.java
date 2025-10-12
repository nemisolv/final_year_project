package com.nemisolv.starter.enums;

import lombok.Getter;

@Getter
public enum ApiResponseCode {

    // identity service errors
    EMAIL_NOT_VERIFIED(1001, "Email is not verified"),
    EMAIL_ALREADY_VERIFIED(1006, "Email is already verified"),
    EMAIL_ALREADY_REGISTERED(1008, "Email is already registered"),
    BAD_CREDENTIALS(1002, "Authentication failed"),
    INVALID_TOKEN(1003, "Invalid token"),
    TOKEN_EXPIRED(1004, "Token expired"),
    INVALID_VERIFICATION_TOKEN(1009, "Invalid verification token"),
    VERIFICATION_TOKEN_EXPIRED(1010, "Verification token has expired"),
    USER_NOT_FOUND(1005, "User not found"),
    RATE_LIMIT_EXCEEDED(1007, "Too many requests. Please try again later"),
    WEAK_PASSWORD(1011, "Password is too weak"),
    REFRESH_TOKEN_EXPIRED(1012, "Refresh token has expired"),
    REFRESH_TOKEN_REVOKED(1013, "Refresh token has been revoked"),
    INVALID_REFRESH_TOKEN(1014, "Invalid refresh token"),
    TOKEN_REUSE_DETECTED(1015, "Token reuse detected. Please login again"),
    SESSION_EXPIRED(1016, "Session has expired. Please login again"),
    INVALID_RESET_TOKEN(1017, "Invalid password reset token"),
    RESET_TOKEN_EXPIRED(1018, "Password reset token has expired"),




    // common errors
    BAD_REQUEST(4000, "Client bad request"),
    INTERNAL_ERROR(1500, "Internal server error"),
    UNAUTHORIZED(4001, "Unauthorized"),
    RESOURCE_NOT_FOUND(4004, "Resource not found"),
    METHOD_NOT_ALLOWED(4005, "HTTP method not allowed"),
    VALIDATION_ERROR(4002, "Validation failed"),
    INVALID_PARAMETER(4003, "Invalid parameter"),
    ACCESS_DENIED(4031, "Access denied"),
    DATABASE_ERROR(5001, "Database error occurred"),

    OPERATION_FAILED(5000, "Operation failed"),




    // success with 9xxx
    OPERATION_SUCCEED(9999, "Operation succeeded");


    private final int code;
    private final String message;

    ApiResponseCode(int code, String message) {
        this.code = code;
        this.message = message;
    }



}


