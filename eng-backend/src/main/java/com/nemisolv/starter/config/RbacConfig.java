package com.nemisolv.starter.config;

import com.nemisolv.starter.service.RbacService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RBAC Configuration
 * Initializes default roles and permissions on application startup
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class RbacConfig {
    
    private final RbacService rbacService;
    private final AppProperties appProperties;

    /**
     * Initialize default roles and permissions on application startup
     */
    @Bean
    public CommandLineRunner initializeRbac() {
        if(!appProperties.isEnableSeedingDb()) {
            log.warn("Rbac seeding configuration is disabled");
            return args -> {};
        }
        return args -> {
            try {
                log.info("Initializing RBAC system...");
                rbacService.initializeDefaultRolesAndPermissions();
                log.info("RBAC system initialized successfully");
            } catch (Exception e) {
                log.error("Failed to initialize RBAC system: {}", e.getMessage());
                // Don't fail the application startup if RBAC initialization fails
            }
        };
    }
}
