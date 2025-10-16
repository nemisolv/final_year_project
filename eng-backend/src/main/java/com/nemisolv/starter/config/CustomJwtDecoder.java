package com.nemisolv.starter.config;

import com.nemisolv.starter.enums.ApiResponseCode;
import com.nemisolv.starter.exception.CustomAuthenticationException;
import com.nemisolv.starter.exception.auth.AuthenticationException;
import com.nemisolv.starter.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Arrays;
import java.util.Objects;

@Component
@Slf4j
@RequiredArgsConstructor
public class CustomJwtDecoder implements JwtDecoder {   
    
    private final JwtService jwtService;

    public boolean validateToken(String token) {
        return jwtService.validateToken(token);
    }

    public SecretKey getSecretKey() {
        return jwtService.getSecretKey();
    }

    private NimbusJwtDecoder nimbusJwtDecoder = null;
    @Override
    public Jwt decode(String token) throws JwtException {

        try {



            // Check if token is null or empty
            if (token == null || token.trim().isEmpty()) {
                log.debug("No token provided for decoding");
                throw new CustomAuthenticationException(ApiResponseCode.INVALID_TOKEN);
            }
            
            // Use JwtService for validation
            log.debug("Decoding JWT token: {}", token.substring(0, Math.min(20, token.length())) + "...");
            if (!jwtService.validateToken(token)) {
                throw new CustomAuthenticationException(ApiResponseCode.INVALID_TOKEN);
            }

            // Initialize NimbusJwtDecoder if not already done
            if (Objects.isNull(nimbusJwtDecoder)) {
                SecretKeySpec secretKeySpec = new SecretKeySpec(
                    jwtService.getSecretKey().getEncoded(),
                    "HmacSHA256"
                );
                nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                        .macAlgorithm(MacAlgorithm.HS256)
                        .build();
            }

            // Decode the JWT using Nimbus
            return nimbusJwtDecoder.decode(token);

        } catch (Exception e) {
            log.error("Error decoding JWT token", e);
//            throw new JwtException("Token invalid: " + e.getMessage());
//            throw new AuthenticationException(ApiResponseCode.INVALID_TOKEN);
            throw new CustomAuthenticationException(ApiResponseCode.INVALID_TOKEN);
        }
    }

}
