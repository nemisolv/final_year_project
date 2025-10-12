package com.nemisolv.starter.payload;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class IntrospectTokenResponse {
    private boolean valid;
}
