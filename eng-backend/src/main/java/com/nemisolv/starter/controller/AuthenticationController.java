package com.nemisolv.starter.controller;

import com.nemisolv.starter.annotation.RateLimit;
import com.nemisolv.starter.annotation.datasource.LogDatasource;
import com.nemisolv.starter.enums.ApiResponseCode;
import com.nemisolv.starter.payload.ApiResponse;
import com.nemisolv.starter.payload.auth.*;
import com.nemisolv.starter.service.AuthService;
import com.nemisolv.starter.util.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
@Slf4j
public class AuthenticationController {
    private final AuthService authService;


    @PostMapping("/login")
//    @RateLimit(limit = 5, duration = 15, key = "login")
    @LogDatasource
    public ApiResponse<AuthenticationResponse> login(@RequestBody @Valid AuthenticationRequest request) {
        AuthenticationResponse response = authService.authenticate(request);
        return ApiResponse.success(response);
    }

    @PostMapping("/register")
//    @RateLimit(limit = 3, duration = 60, key = "register")
    public ApiResponse<Void> register(@RequestBody @Valid RegisterRequest request)  {
        authService.register(request);
        return ApiResponse.<Void>builder()
                .code(ApiResponseCode.OPERATION_SUCCEED.getCode())
                .message("Registration successful. Please check your email to verify your account.")
                .build();
    }

    @PostMapping("/verify-email")
    public ApiResponse<Void> verifyEmail(@RequestBody @Valid VerificationTokenRequest request) {
        authService.verifyEmail(request);
        return ApiResponse.<Void>builder()
                .code(ApiResponseCode.OPERATION_SUCCEED.getCode())
                .message("Email verified successfully. You can now log in to your account.")
                .build();
    }

    @PostMapping("/resend-verification-email")
    @RateLimit(limit = 3, duration = 60, key = "resend-verification")
    public ApiResponse<Void> resendVerificationEmail(@RequestBody @Valid ResendVerificationEmailRequest request) {
        authService.resendVerificationEmail(request.getEmail());
        return ApiResponse.<Void>builder()
                .code(ApiResponseCode.OPERATION_SUCCEED.getCode())
                .message("Verification email has been resent. Please check your inbox.")
                .build();
    }

    @PostMapping("/refresh-token")
    public ApiResponse<AuthenticationResponse> refreshToken(@RequestBody @Valid RefreshTokenRequest request) {
        AuthenticationResponse response = authService.refreshToken(request);
        return ApiResponse.success(response);
    }

    @PostMapping("/request-password-reset")
    @RateLimit(limit = 3, duration = 60, key = "password-reset")
    public ApiResponse<Void> requestPasswordReset(@RequestBody @Valid PasswordResetRequest request) {
        authService.requestPasswordReset(request);
        return ApiResponse.<Void>builder()
                .code(ApiResponseCode.OPERATION_SUCCEED.getCode())
                .message("If an account exists with this email, you will receive a password reset link.")
                .build();
    }

    @PostMapping("/confirm-password-reset")
    public ApiResponse<Void> confirmPasswordReset(@RequestBody @Valid PasswordResetConfirmRequest request) {
        authService.confirmPasswordReset(request);
        return ApiResponse.<Void>builder()
                .code(ApiResponseCode.OPERATION_SUCCEED.getCode())
                .message("Password has been reset successfully. You can now log in with your new password.")
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(
            @RequestHeader(value = "Authorization") String authHeader) {

        // Extract access token from Authorization header
        String accessToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            accessToken = authHeader.substring(7);
        }

        authService.logout(accessToken);
        return ApiResponse.<Void>builder()
                .code(ApiResponseCode.OPERATION_SUCCEED.getCode())
                .message("Logged out successfully")
                .build();
    }

    @PostMapping("/logout-all-devices")
    public ApiResponse<Void> logoutAllDevices(@AuthenticationPrincipal Jwt jwt) {
        Integer userId = JwtUtils.getUserId(jwt);
        authService.logoutAllDevices(userId);

        return ApiResponse.<Void>builder()
                .code(ApiResponseCode.OPERATION_SUCCEED.getCode())
                .message("Logged out from all devices successfully")
                .build();
    }
}
