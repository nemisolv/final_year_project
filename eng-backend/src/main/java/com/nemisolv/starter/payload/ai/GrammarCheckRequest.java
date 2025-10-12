package com.nemisolv.starter.payload.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GrammarCheckRequest {
    @NotBlank
    private String text;
}