package com.nemisolv.starter.payload.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class AuthenticationResponse {
    private String accessToken;
    private String refreshToken;

    /**
     * Map of role names to their associated permission names
     * Example: {"ADMIN": ["USER_CREATE", "USER_READ", ...], "TEACHER": ["LESSON_CREATE", ...]}
     */
    private Map<String, List<String>> scopes;
}
