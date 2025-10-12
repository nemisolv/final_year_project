package com.nemisolv.starter.payload.ai;

import lombok.Data;

import java.util.List;

@Data
public class GrammarCheckResponse {
    private String originalText;
    private String correctedText;
    private List<GrammarError> errors;
}