package com.nemisolv.starter.controller;


import com.nemisolv.starter.entity.User;
import com.nemisolv.starter.enums.ApiResponseCode;
import com.nemisolv.starter.payload.ApiResponse;
import com.nemisolv.starter.payload.profile.UserOnboardingRequest;
import com.nemisolv.starter.payload.profile.UserProfileUpdateRequest;
import com.nemisolv.starter.payload.response.FullInfoProfile;
import com.nemisolv.starter.payload.response.UserDashboardStatsResponse;

import com.nemisolv.starter.service.UserService;
import com.nemisolv.starter.service.UserStatsService;
import com.nemisolv.starter.util.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
@Slf4j
public class UserProfileController {

    private final UserService userService;
    private final UserStatsService userStatsService;

    @GetMapping("/me")
    public ApiResponse<FullInfoProfile> getFullInfoProfileOfCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        // Extract userId directly from JWT - no database lookup needed!
        Integer userId = JwtUtils.getUserId(jwt);
        log.info("Fetching current user profile for userId: {}", userId);

        FullInfoProfile fullProfile = userService.getFullProfile(userId);
        return ApiResponse.success(fullProfile);
    }

    @PostMapping("/onboarding")
    public ApiResponse<Void> onboarding(
            @RequestBody @Valid UserOnboardingRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        Integer userId = JwtUtils.getUserId(jwt);
        log.info("Processing onboarding for userId: {}", userId);

        userService.onboarding(userId, request);

        return ApiResponse.<Void>builder()
                .code(ApiResponseCode.OPERATION_SUCCEED.getCode())
                .message("Onboarding completed successfully")
                .build();
    }

    @PutMapping("/me")
    public ApiResponse<FullInfoProfile> updateCurrentUserProfile(
            @RequestBody @Valid UserProfileUpdateRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        Integer userId = JwtUtils.getUserId(jwt);
        log.info("Updating profile for userId: {}", userId);

        FullInfoProfile updatedProfile = userService.updateCurrentUserProfile(userId, request);

        return ApiResponse.success(updatedProfile);
    }

    @GetMapping("/me/dashboard-stats")
    public ApiResponse<UserDashboardStatsResponse> getDashboardStats(@AuthenticationPrincipal Jwt jwt) {
        Integer userId = JwtUtils.getUserId(jwt);
        log.info("Fetching dashboard stats for userId: {}", userId);

        UserDashboardStatsResponse stats = userStatsService.getDashboardStats(userId.longValue());
        return ApiResponse.success(stats);
    }

}
