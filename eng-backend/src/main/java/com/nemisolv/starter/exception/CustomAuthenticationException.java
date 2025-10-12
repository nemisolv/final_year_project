package com.nemisolv.starter.exception;

import com.nemisolv.starter.enums.ApiResponseCode;
import lombok.Getter;
import org.springframework.security.core.AuthenticationException;

@Getter
public class CustomAuthenticationException extends AuthenticationException {
    private final ApiResponseCode code;

    public CustomAuthenticationException(ApiResponseCode code) {
        super(code.name());
        this.code = code;
    }

    public CustomAuthenticationException(ApiResponseCode code, String msg) {
        super(msg);
        this.code = code;
    }

}
