package com.nemisolv.starter.payload.ai;

import lombok.Data;

import java.util.List;

@Data
public class GrammarError {
    private int offset;
    private int errorLength;
    private String message;
    private List<String> suggestions;
}

