package com.nemisolv.starter.exception;

import com.nemisolv.starter.enums.ApiResponseCode;
import com.nemisolv.starter.exception.base.BaseApplicationException;
import com.nemisolv.starter.exception.base.ClientBaseException;
import com.nemisolv.starter.exception.base.ServerBaseException;
import com.nemisolv.starter.exception.validation.ValidationException;
import com.nemisolv.starter.payload.error.ErrorResponse;
import com.nemisolv.starter.payload.error.FieldError;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindingResult;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Global exception handler for the application
 * Provides consistent error responses using ErrorResponse
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @Value("${app.debug:false}")
    private boolean debugMode;

    // ==================== Custom Application Exceptions ====================

    /**
     * Unified handler for all ApplicationException types
     * Handles metadata, logging levels, and consistent error responses
     */
    @ExceptionHandler(ServerBaseException.class)
    public ResponseEntity<ErrorResponse> handleApplicationException(
            ServerBaseException ex, HttpServletRequest request) {

        HttpStatus status = ex.getHttpStatus();

        // Log at appropriate level based on status code
        if (ex.isServerError()) {
            log.error("Server error on {}: {} - {}", request.getRequestURI(),
                    ex.getResponseCode().getCode(), ex.getMessage(), ex);
        } else if (ex.isClientError()) {
            log.warn("Client error on {}: {} - {}", request.getRequestURI(),
                    ex.getResponseCode().getCode(), ex.getMessage());
        }

        ErrorResponse.ErrorResponseBuilder responseBuilder = ErrorResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .code(String.valueOf(ex.getCode()))
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .requestId(getRequestId());

        // Add debug info for server errors
        if (ex.isServerError() && debugMode) {
            responseBuilder.debugMessage(ex.getMessage())
                    .stackTrace(getStackTrace(ex));
        }

        return ResponseEntity.status(status).body(responseBuilder.build());
    }




    @ExceptionHandler(ClientBaseException.class)
    public ResponseEntity<ErrorResponse> handleApplicationException(
            ClientBaseException ex, HttpServletRequest request) {

        HttpStatus status = ex.getHttpStatus();

        // Log at appropriate level based on status code
        if (ex.isServerError()) {
            log.error("Server error on {}: {} - {}", request.getRequestURI(),
                    ex.getResponseCode().getCode(), ex.getMessage(), ex);
        } else if (ex.isClientError()) {
            log.warn("Client error on {}: {} - {}", request.getRequestURI(),
                    ex.getResponseCode().getCode(), ex.getMessage());
        }

        ErrorResponse.ErrorResponseBuilder responseBuilder = ErrorResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .code(String.valueOf(ex.getCode()))
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .requestId(getRequestId());

        // Add metadata if available (e.g., for rate limit exceptions)
        if (ex.getMetadata() != null && !ex.getMetadata().isEmpty()) {
//            responseBuilder.(ex.getMetadata());
        }

        // Add debug info for server errors
        if (ex.isServerError() && debugMode) {
            responseBuilder.debugMessage(ex.getMessage())
                    .stackTrace(getStackTrace(ex));
        }

        return ResponseEntity.status(status).body(responseBuilder.build());
    }


    /**
     * Legacy handler for BaseApplicationException
     * @deprecated Will be removed in future version - use ApplicationException instead
     */
    @Deprecated
    @ExceptionHandler(BaseApplicationException.class)
    public ResponseEntity<ErrorResponse> handleBaseApplicationException(
            BaseApplicationException ex, HttpServletRequest request) {
        log.error("Application exception: {} - {}", ex.getErrorCode(), ex.getMessage(), ex);

        HttpStatus status = HttpStatus.valueOf(ex.getHttpStatus());

        ErrorResponse.ErrorResponseBuilder responseBuilder = ErrorResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .code(ex.getErrorCode())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .requestId(getRequestId());

        if (ex instanceof ValidationException validationEx) {
            responseBuilder.errors(buildFieldErrors(validationEx.getFieldErrors()));
        }

        if (debugMode) {
            responseBuilder.debugMessage(ex.getMessage())
                    .stackTrace(getStackTrace(ex));
        }

        return ResponseEntity.status(status).body(responseBuilder.build());
    }

    @ExceptionHandler(InternalServerError.class)
    public ResponseEntity<ErrorResponse> handleInternalServerError(
            InternalServerError ex, HttpServletRequest request) {
        log.error("Internal server error on {}: {}", request.getRequestURI(), ex.getMessage(), ex);

        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        ApiResponseCode code = ApiResponseCode.INTERNAL_ERROR;

        ErrorResponse.ErrorResponseBuilder responseBuilder = ErrorResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .code(String.valueOf(code.getCode()))
                .message(code.getMessage())
                .path(request.getRequestURI())
                .requestId(getRequestId());

        if (debugMode) {
            responseBuilder.debugMessage(ex.getMessage())
                    .stackTrace(getStackTrace(ex));
        }

        return ResponseEntity.status(status).body(responseBuilder.build());
    }

    // ==================== Spring Framework Exceptions ====================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        log.warn("Validation failed on {}: {}", request.getRequestURI(), ex.getMessage());

        HttpStatus status = HttpStatus.BAD_REQUEST;
        ApiResponseCode code = ApiResponseCode.VALIDATION_ERROR;

        ErrorResponse response = ErrorResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .code(String.valueOf(code.getCode()))
                .message(code.getMessage())
                .path(request.getRequestURI())
                .requestId(getRequestId())
                .errors(buildFieldErrors(ex.getBindingResult()))
                .build();

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        log.warn("Type mismatch on {}: {}", request.getRequestURI(), ex.getMessage());

        HttpStatus status = HttpStatus.BAD_REQUEST;
        ApiResponseCode code = ApiResponseCode.INVALID_PARAMETER;

        String message = String.format("Parameter '%s' should be of type %s",
                ex.getName(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");

        ErrorResponse response = ErrorResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .code(String.valueOf(code.getCode()))
                .message(message)
                .path(request.getRequestURI())
                .requestId(getRequestId())
                .build();

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFound(
            NoResourceFoundException ex, HttpServletRequest request) {
        log.warn("Resource not found: {} {}", request.getMethod(), request.getRequestURI());

        HttpStatus status = HttpStatus.NOT_FOUND;
        ApiResponseCode code = ApiResponseCode.RESOURCE_NOT_FOUND;

        String message = String.format("The requested resource '%s' was not found", request.getRequestURI());

        ErrorResponse response = ErrorResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .code(String.valueOf(code.getCode()))
                .message(message)
                .path(request.getRequestURI())
                .requestId(getRequestId())
                .build();

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        log.warn("Method not supported: {} on {}", request.getMethod(), request.getRequestURI());

        HttpStatus status = HttpStatus.METHOD_NOT_ALLOWED;
        ApiResponseCode code = ApiResponseCode.METHOD_NOT_ALLOWED;

        String supportedMethods = ex.getSupportedHttpMethods() != null
                ? String.join(", ", ex.getSupportedHttpMethods().stream().map(Object::toString).toList())
                : "N/A";

        String message = String.format("HTTP method '%s' is not supported. Supported methods: %s",
                ex.getMethod(), supportedMethods);

        ErrorResponse response = ErrorResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .code(String.valueOf(code.getCode()))
                .message(message)
                .path(request.getRequestURI())
                .requestId(getRequestId())
                .build();

        return ResponseEntity.status(status).body(response);
    }

    // ==================== Spring Security Exceptions ====================

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex, HttpServletRequest request) {
        log.warn("Authentication failed on {}: {}", request.getRequestURI(), ex.getMessage());

        HttpStatus status = HttpStatus.UNAUTHORIZED;
        ApiResponseCode code = ApiResponseCode.BAD_CREDENTIALS;

        ErrorResponse response = ErrorResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .code(String.valueOf(code.getCode()))
                .message(code.getMessage())
                .path(request.getRequestURI())
                .requestId(getRequestId())
                .build();

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        log.warn("Access denied on {}: {}", request.getRequestURI(), ex.getMessage());

        HttpStatus status = HttpStatus.FORBIDDEN;
        ApiResponseCode code = ApiResponseCode.ACCESS_DENIED;

        ErrorResponse response = ErrorResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .code(String.valueOf(code.getCode()))
                .message(code.getMessage())
                .path(request.getRequestURI())
                .requestId(getRequestId())
                .build();

        return ResponseEntity.status(status).body(response);
    }

    // ==================== Database Exceptions ====================

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDataAccessException(
            DataAccessException ex, HttpServletRequest request) {
        log.error("Database error on {}: {}", request.getRequestURI(), ex.getMessage(), ex);

        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        ApiResponseCode code = ApiResponseCode.DATABASE_ERROR;

        ErrorResponse.ErrorResponseBuilder responseBuilder = ErrorResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .code(String.valueOf(code.getCode()))
                .message(code.getMessage())
                .path(request.getRequestURI())
                .requestId(getRequestId());

        if (debugMode) {
            responseBuilder.debugMessage(ex.getMessage())
                    .stackTrace(getStackTrace(ex));
        }

        return ResponseEntity.status(status).body(responseBuilder.build());
    }

    // ==================== Generic Exception Handler ====================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception on {}: {}", request.getRequestURI(), ex.getMessage(), ex);

        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        ApiResponseCode code = ApiResponseCode.INTERNAL_ERROR;

        ErrorResponse.ErrorResponseBuilder responseBuilder = ErrorResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .code(String.valueOf(code.getCode()))
                .message(code.getMessage())
                .path(request.getRequestURI())
                .requestId(getRequestId());

        if (debugMode) {
            responseBuilder.debugMessage(ex.getMessage())
                    .stackTrace(getStackTrace(ex));
        }

        return ResponseEntity.status(status).body(responseBuilder.build());
    }

    // ==================== Helper Methods ====================

    private List<FieldError> buildFieldErrors(Map<String, String> fieldErrors) {
        return fieldErrors.entrySet().stream()
                .map(entry -> FieldError.builder()
                        .field(entry.getKey())
                        .message(entry.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<FieldError> buildFieldErrors(BindingResult bindingResult) {
        return bindingResult.getFieldErrors().stream()
                .map(error -> FieldError.builder()
                        .field(error.getField())
                        .message(error.getDefaultMessage())
                        .rejectedValue(error.getRejectedValue())
                        .constraint(error.getCode())
                        .build())
                .collect(Collectors.toList());
    }

    private String getRequestId() {
        String requestId = MDC.get("requestId");
        return (requestId != null && !requestId.isEmpty()) ? requestId : UUID.randomUUID().toString();
    }

    private String getStackTrace(Throwable ex) {
        if (ex == null) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        sb.append(ex.getClass().getName()).append(": ").append(ex.getMessage()).append("\n");
        for (StackTraceElement element : ex.getStackTrace()) {
            sb.append("\tat ").append(element.toString()).append("\n");
            // Limit stack trace to first 10 lines
            if (sb.length() > 2000) {
                sb.append("\t... (truncated)\n");
                break;
            }
        }
        return sb.toString();
    }
}
