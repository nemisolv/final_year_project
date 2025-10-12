package com.nemisolv.starter.payload.profile;

public record CreateUserProfileRequest(
        Integer userId,
    String name,
    String email,
    String username,
    boolean isOnboarded
) {
} 
