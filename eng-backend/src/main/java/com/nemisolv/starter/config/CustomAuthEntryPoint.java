package com.nemisolv.starter.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nemisolv.starter.enums.ApiResponseCode;
import com.nemisolv.starter.payload.ApiResponse;
import com.nemisolv.starter.payload.error.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class CustomAuthEntryPoint implements AuthenticationEntryPoint {
    private final ObjectMapper objectMapper;

    public CustomAuthEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        log.error("Authentication error: {}", authException.getMessage());
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");

        ErrorResponse.ErrorResponseBuilder responseBuilder = ErrorResponse.builder()
                .status(response.getStatus())
                .error(ApiResponseCode.INVALID_TOKEN.getMessage())
                .code(String.valueOf(ApiResponseCode.INVALID_TOKEN.getCode()))
                .message(ApiResponseCode.INVALID_TOKEN.getMessage())
                .path(request.getRequestURI())
                ;
//                .requestId(getRequestId());
        response.getWriter().write(objectMapper.writeValueAsString(responseBuilder.build()));
    }
}
