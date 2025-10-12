package com.nemisolv.starter.exception;

import com.nemisolv.starter.enums.ApiResponseCode;
import lombok.Getter;

@Getter
public class InternalServerError extends RuntimeException {
    private ApiResponseCode apiResponseCode;

    public InternalServerError(String message) {
        super(message);
    }
    public InternalServerError(ApiResponseCode apiResponseCode) {
        super(apiResponseCode.getMessage());
        this.apiResponseCode = apiResponseCode;
    }

}
