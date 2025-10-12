package com.nemisolv.starter.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

/**
 * Filter to add correlation ID to every request for tracking and debugging
 * The correlation ID is:
 * 1. Added to MDC (Mapped Diagnostic Context) for logging
 * 2. Returned in response headers
 * 3. Can be used in error responses
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter implements Filter {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String MDC_KEY = "requestId";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        // Only process HTTP requests
        if (!(request instanceof HttpServletRequest) || !(response instanceof HttpServletResponse)) {
            chain.doFilter(request, response);
            return;
        }

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        try {
            // Try to get correlation ID from request header
            String correlationId = httpRequest.getHeader(CORRELATION_ID_HEADER);

            // If not provided by client, check X-Request-ID header
            if (correlationId == null || correlationId.isEmpty()) {
                correlationId = httpRequest.getHeader(REQUEST_ID_HEADER);
            }

            // If still not available, generate new one
            if (correlationId == null || correlationId.isEmpty()) {
                correlationId = generateCorrelationId();
            }

            // Add to MDC for logging
            MDC.put(MDC_KEY, correlationId);

            // Add to response headers so client can use it
            httpResponse.setHeader(CORRELATION_ID_HEADER, correlationId);
            httpResponse.setHeader(REQUEST_ID_HEADER, correlationId);

            // Log the request
            log.debug("Incoming request: {} {} [{}]",
                    httpRequest.getMethod(),
                    httpRequest.getRequestURI(),
                    correlationId);

            // Continue with the request
            chain.doFilter(request, response);

        } finally {
            // Always clean up MDC to prevent memory leaks
            MDC.remove(MDC_KEY);
        }
    }

    /**
     * Generate a unique correlation ID
     * Format: uuid (e.g., "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
     */
    private String generateCorrelationId() {
        return UUID.randomUUID().toString();
    }
}
