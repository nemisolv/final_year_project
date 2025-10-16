package com.nemisolv.starter.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Redis Cache Configuration for User Management
 * Different TTL for different cache types
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Configure ObjectMapper to handle Java 8 date/time types
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        // Enable default typing for polymorphic type handling
        objectMapper.activateDefaultTyping(
            objectMapper.getPolymorphicTypeValidator(),
            ObjectMapper.DefaultTyping.NON_FINAL
        );

        // Default cache configuration
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10)) // Default 10 minutes
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new StringRedisSerializer()
                )
            )
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new GenericJackson2JsonRedisSerializer(objectMapper)
                )
            )
            .disableCachingNullValues();

        // Custom cache configurations with different TTL
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();

        // User management list - 5 minutes (frequently changing)
        cacheConfigurations.put("userManagementList",
            defaultConfig.entryTtl(Duration.ofMinutes(5)));

        // User management detail - 15 minutes (less frequently changing)
        cacheConfigurations.put("userManagementDetail",
            defaultConfig.entryTtl(Duration.ofMinutes(15)));

        // User management count - 5 minutes
        cacheConfigurations.put("userManagementCount",
            defaultConfig.entryTtl(Duration.ofMinutes(5)));

        // User management search - 2 minutes (very dynamic)
        cacheConfigurations.put("userManagementSearch",
            defaultConfig.entryTtl(Duration.ofMinutes(2)));

        // Roles - 30 minutes (rarely change)
        cacheConfigurations.put("rolesList",
            defaultConfig.entryTtl(Duration.ofMinutes(30)));

        cacheConfigurations.put("roleDetail",
            defaultConfig.entryTtl(Duration.ofMinutes(30)));

        // Permissions - 60 minutes (very rarely change)
        cacheConfigurations.put("permissionsList",
            defaultConfig.entryTtl(Duration.ofHours(1)));

        // Courses - 15 minutes
        cacheConfigurations.put("coursesList",
            defaultConfig.entryTtl(Duration.ofMinutes(15)));

        cacheConfigurations.put("courseDetail",
            defaultConfig.entryTtl(Duration.ofMinutes(30)));

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(defaultConfig)
            .withInitialCacheConfigurations(cacheConfigurations)
            .transactionAware()
            .build();
    }
}
