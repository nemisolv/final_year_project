package com.nemisolv.starter.payload.auth;

import lombok.*;
import org.hibernate.validator.constraints.Length;
import com.nemisolv.starter.util.Constants;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VerificationTokenRequest {
    // 64 because of using SHA-256 algorithm to hash, the algo will always return 64 characters
    @Length(min=6, max = 64, message = "Token input required at least : " + Constants.OTP_LENGTH + " characters, and maximum length is 64")
    private String token;

}
