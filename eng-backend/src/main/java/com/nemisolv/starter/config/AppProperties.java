package com.nemisolv.starter.config;

import lombok.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@ConfigurationProperties(prefix = "app")
@Component
@Getter
public class AppProperties {
    private final OAuth2 oauth2 = new OAuth2();
    private final Secure secure = new Secure();
    private  final boolean enableSeedingDb = false;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OAuth2 {
        private List<String> authorizedRedirectUris;
    }

    @Data
    public static class Secure {
        private String secretKey;
        private Long tokenExpire;
        private Long refreshTokenExpire;
    }

}
