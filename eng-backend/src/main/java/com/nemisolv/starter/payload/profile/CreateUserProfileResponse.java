package com.nemisolv.starter.payload.profile;

public record CreateUserProfileResponse(
    Long id,
    Long userId,
    String name,
    String email,
    String username
) {

}
