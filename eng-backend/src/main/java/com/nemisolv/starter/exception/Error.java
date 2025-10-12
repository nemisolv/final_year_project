package com.nemisolv.starter.exception;


import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class Error {
    private String path;
    private LocalDateTime timestamp;
    private List<String> errors;
    private int code;
    private String errorCode; // standardized error code key

    public void addError(String error) {
        errors.add(error);
    }
}
