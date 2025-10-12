package com.nemisolv.starter.config;

import lombok.Data;
import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@ConfigurationProperties(prefix = "spring.datasource")
@Configuration
@Getter
public class PersistenceProperties {
    private final Mariadb mariadb = new Mariadb();
    @Data
    public static class Mariadb {
        private String url;
        private String username;
        private String password;
        private String driverClassName;
        private String poolName;
        private int poolSize;
        private int maxLifetime;
        private int minIdle;
    }
}
