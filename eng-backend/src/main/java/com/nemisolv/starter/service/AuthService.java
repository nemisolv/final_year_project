package com.nemisolv.starter.service;

import com.nemisolv.starter.entity.*;
import com.nemisolv.starter.enums.RoleName;
import com.nemisolv.starter.helper.HashingHelper;
import com.nemisolv.starter.config.CustomJwtDecoder;
import com.nemisolv.starter.enums.ApiResponseCode;
import com.nemisolv.starter.enums.AuthProvider;
import com.nemisolv.starter.enums.UserStatus;
import com.nemisolv.starter.exception.auth.AuthenticationException;
import com.nemisolv.starter.exception.BadRequestException;
import com.nemisolv.starter.exception.NotFoundException;
import com.nemisolv.starter.payload.IntrospectTokenRequest;
import com.nemisolv.starter.payload.IntrospectTokenResponse;
import com.nemisolv.starter.payload.auth.AuthenticationRequest;
import com.nemisolv.starter.payload.auth.AuthenticationResponse;
import com.nemisolv.starter.payload.auth.PasswordResetConfirmRequest;
import com.nemisolv.starter.payload.auth.PasswordResetRequest;
import com.nemisolv.starter.payload.auth.RefreshTokenRequest;
import com.nemisolv.starter.payload.auth.RegisterRequest;
import com.nemisolv.starter.payload.auth.VerificationTokenRequest;
import com.nemisolv.starter.payload.profile.CreateUserProfileRequest;
import com.nemisolv.starter.repository.ConfirmationEmailRepository;
import com.nemisolv.starter.repository.UserRepository;
import com.nemisolv.starter.security.UserPrincipal;
import com.nemisolv.starter.notification.EmailVerificationRequest;
import com.nemisolv.starter.notification.PasswordResetEmailRequest;
import com.nemisolv.starter.util.Constants;
import org.apache.commons.lang3.RandomStringUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final ConfirmationEmailRepository confirmationEmailRepo;
    private final HashingHelper hashingHelper;
    private final CustomJwtDecoder customJwtDecoder;
    private final JwtService jwtService;
    private final RbacService rbacService;
    private final NotificationService notificationService;
    private final UserService userService;
    private final RateLimitService rateLimitService;
    private final RefreshTokenService refreshTokenService;
    private final TokenStorageService tokenStorageService;


    public AuthenticationResponse authenticate(AuthenticationRequest authRequest) {
        String email = authRequest.email().toLowerCase().trim();
        String clientIp = getClientIpAddress();

        // Find user
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> {
                    return new AuthenticationException(ApiResponseCode.BAD_CREDENTIALS);
                });

        // Verify password
        if (user.getHashedPassword() == null ||
                !passwordEncoder.matches(authRequest.password(), user.getHashedPassword())) {
            throw new AuthenticationException(ApiResponseCode.BAD_CREDENTIALS);
        }

        // Check email verification
        if (!user.isEmailVerified()) {
            log.debug("Email {} not verified", email);
            throw new AuthenticationException(ApiResponseCode.EMAIL_NOT_VERIFIED);
        }

        // Update last login
        userRepo.updateLastLoginAtForEmail(user.getId());

        return buildAuthenticationResponse(user);
    }


    @Transactional
    public void register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        // Check if user already exists
        Optional<User> existingUser = userRepo.findByEmail(normalizedEmail);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (user.isEmailVerified()) {
                throw new BadRequestException(ApiResponseCode.EMAIL_ALREADY_REGISTERED);
            } else {
                throw new BadRequestException(ApiResponseCode.EMAIL_NOT_VERIFIED,
                        "Email already registered but not verified.");
            }
        }

        // Create new user
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        String username = generateUniqueUsername(request.getName());

        User newUser = User.builder()
                .email(normalizedEmail)
                .username(username)
                .hashedPassword(hashedPassword)
                .status(UserStatus.ACTIVE)
                .authProvider(AuthProvider.LOCAL)
                .emailVerified(false)
                .build();

        // Save user
        Integer userId = userRepo.signUpNormalUser(newUser);
        if (userId == null) {
            throw new BadRequestException(ApiResponseCode.INTERNAL_ERROR, "Failed to create user");
        }
        newUser.setId(userId);

        // Assign default role
        rbacService.assignRoleToUser(newUser.getId(), RoleName.STUDENT);

        // Create user profile
        createUserProfile(newUser, request.getName());

        // Generate and send verification email
        sendVerificationEmail(newUser);

        log.info("User registered successfully: {}", normalizedEmail);
    }


    @Transactional
    public AuthenticationResponse refreshToken(RefreshTokenRequest request) {
        try {
            // Step 1: Validate and atomically revoke the old refresh token
            // This prevents concurrent reuse and implements the Token Rotation security pattern
            RefreshToken oldToken = refreshTokenService.validateAndPrepareRotation(request.getRefreshToken());

            // Find user
            User user = userRepo.findById(oldToken.getUserId().intValue())
                    .orElseThrow(() -> new AuthenticationException(ApiResponseCode.USER_NOT_FOUND));

            // Check if user is active
            if (!UserStatus.ACTIVE.getValue().equals(user.getStatus().getValue())) {
                throw new AuthenticationException(ApiResponseCode.USER_NOT_FOUND, "User account is not active");
            }

            // Step 2: Generate new access token
            Map<String, List<String>> rolePermissionMap = rbacService.getRolePermissionNameForUser(user.getId());

            UserPrincipal userPrincipal = UserPrincipal.create(user, rolePermissionMap);
            String newAccessToken = jwtService.generateToken(userPrincipal);

            // Extract JTI from new access token
            String newAccessTokenJti = jwtService.extractJti(newAccessToken);

            // Step 3: Generate new refresh token (this also gets its ID from DB)
            String newRefreshToken = refreshTokenService.generateRefreshToken(user, newAccessTokenJti);

            // Step 4: Link old token to new token (enables token reuse detection)
            // This completes the rotation chain: oldToken.replacedBy = newToken.id
            refreshTokenService.completeRotation(oldToken.getTokenHash(),
                refreshTokenService.getTokenIdByHash(
                    refreshTokenService.hashToken(newRefreshToken)
                )
            );

            // Update last login
            userRepo.updateLastLoginAtForEmail(user.getId());

            log.info("Token refreshed successfully for user: {}", user.getEmail());

            return AuthenticationResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .build();

        } catch (AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to refresh token: {}", e.getMessage(), e);
            throw new AuthenticationException(ApiResponseCode.INVALID_REFRESH_TOKEN);
        }
    }


    @Transactional
    public void verifyEmail(VerificationTokenRequest request) {
        String token = request.getToken();

        // Hash token if it's an OTP (6 characters)
        if (token.length() == Constants.OTP_LENGTH) {
            log.debug("Verifying token(OTP type): {}", token);
            token = hashingHelper.createHashWithSecretKey(token);
        }

        // Find confirmation email by token
        ConfirmationEmail confirmationEmail = confirmationEmailRepo.findByToken(token)
                .orElseThrow(() -> new BadRequestException(ApiResponseCode.INVALID_VERIFICATION_TOKEN));

        // Validate token
        validateVerificationToken(confirmationEmail);

        // Get user
        String email = confirmationEmail.getUserIdentifier();
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException(ApiResponseCode.USER_NOT_FOUND));

        // Check if already verified
        if (user.isEmailVerified()) {
            log.info("Email already verified: {}", email);
            return;
        }

        // Verify email
        userRepo.markEmailVerified(email);
        confirmationEmailRepo.revokeToken(token);

        log.info("Email verified successfully: {}", email);
    }


    @Transactional
    public void resendVerificationEmail(String email) {
        String normalizedEmail = email.toLowerCase().trim();

        // Find user
        User user = userRepo.findByEmail(normalizedEmail)
                .orElseThrow(() -> new NotFoundException(ApiResponseCode.USER_NOT_FOUND));

        // Check if already verified
        if (user.isEmailVerified()) {
            throw new BadRequestException(ApiResponseCode.EMAIL_ALREADY_VERIFIED);
        }

        // Revoke old tokens before generating new one
        confirmationEmailRepo.revokeAllTokensForUser(normalizedEmail);

        // Send new verification email
        sendVerificationEmail(user);

        log.info("Verification email resent to: {}", normalizedEmail);
    }


    public IntrospectTokenResponse introspect(IntrospectTokenRequest request) {
        boolean isValid = customJwtDecoder.validateToken(request.getToken());
        return IntrospectTokenResponse.builder().valid(isValid).build();
    }


    @Transactional
    public void requestPasswordReset(PasswordResetRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        // Check if user exists (don't reveal if they don't for security)
        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) {
            log.info("Password reset requested for non-existent email: {}", email);
            return;
        }

        User user = userOpt.get();

        // Generate reset token
        String resetToken = RandomStringUtils.secureStrong().nextAlphanumeric(Constants.OTP_LENGTH);
        String hashedToken = hashingHelper.createHashWithSecretKey(resetToken);

        // Revoke old reset tokens
        confirmationEmailRepo.revokeAllTokensForUser(email);

        // Store reset token with expiration
        LocalDateTime expTime = LocalDateTime.now().plusMinutes(3);
        confirmationEmailRepo.generateVerificationEmail(email, hashedToken, expTime);

        // Send reset email
        sendPasswordResetEmail(user, resetToken);

        log.info("Password reset token generated for user: {}", email);
    }


    @Transactional
    public void confirmPasswordReset(PasswordResetConfirmRequest request) {
        String token = request.getToken();
        String newPassword = request.getNewPassword();

        // Hash token for lookup
        String hashedToken = hashingHelper.createHashWithSecretKey(token);

        // Find confirmation email by token
        ConfirmationEmail confirmationEmail = confirmationEmailRepo.findByToken(hashedToken)
                .orElseThrow(() -> new BadRequestException(ApiResponseCode.INVALID_RESET_TOKEN));

        // Validate token
        if (confirmationEmail.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException(ApiResponseCode.RESET_TOKEN_EXPIRED);
        }

        if (confirmationEmail.isRevoked()) {
            throw new BadRequestException(ApiResponseCode.INVALID_RESET_TOKEN);
        }

        // Find user and update password
        String email = confirmationEmail.getUserIdentifier();
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException(ApiResponseCode.USER_NOT_FOUND));

        // Update password
        String hashedPassword = passwordEncoder.encode(newPassword);
        userRepo.updatePassword(user.getId(), hashedPassword);

        // Revoke the reset token
        confirmationEmailRepo.revokeToken(hashedToken);

        log.info("Password reset successfully for user: {}", email);
    }


    // ==================== Private Helper Methods ====================

    private AuthenticationResponse buildAuthenticationResponse(User user) {
        // Get roles and permissions in a single efficient query
        Map<String, List<String>> rolePermissionMap = rbacService.getRolePermissionNameForUser(user.getId());

        // Create UserPrincipal for JWT token generation
        UserPrincipal userPrincipal = UserPrincipal.create(user, rolePermissionMap);

        // Generate access token
        String accessToken = jwtService.generateToken(userPrincipal);

        // Extract JTI from access token to link with refresh token
        String accessTokenJti = jwtService.extractJti(accessToken);

        // Generate refresh token with JTI linkage
        String refreshToken = refreshTokenService.generateRefreshToken(user, accessTokenJti);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .roles(rolePermissionMap)
                .build();
    }

    /**
     * Logout - revoke both access and refresh tokens
     * Client only needs to send the access token
     */
    @Transactional
    public void logout(String accessToken) {
        try {
            if (accessToken == null || accessToken.isEmpty()) {
                log.warn("Logout called with empty access token");
                return;
            }

            // Extract JTI from access token
            String jti = jwtService.extractJti(accessToken);
            if (jti == null) {
                log.warn("Could not extract JTI from access token");
                return;
            }

            // Revoke access token (add to blacklist)
            jwtService.revokeToken(accessToken);
            log.debug("Access token revoked: {}", jti);

            // Revoke associated refresh token using JTI
            refreshTokenService.revokeTokenByAccessTokenJti(jti);
            log.debug("Refresh token revoked by access token JTI: {}", jti);

            log.info("User logged out successfully");
        } catch (Exception e) {
            log.error("Failed to logout: {}", e.getMessage());
            // Don't throw error - logout should always succeed from user perspective
        }
    }

    /**
     * Logout from all devices - revoke all refresh tokens and active sessions
     */
    @Transactional
    public void logoutAllDevices(Integer userId) {
        // Revoke all refresh tokens in DB
        int refreshTokensRevoked = refreshTokenService.revokeAllUserTokens(userId.longValue());

        // Revoke all active sessions in Redis
        tokenStorageService.revokeAllUserSessions(userId);

        log.info("User {} logged out from all devices: {} refresh tokens revoked, all active sessions cleared",
                userId, refreshTokensRevoked);
    }

    private void createUserProfile(User user, String name) {
        try {
            CreateUserProfileRequest request = new CreateUserProfileRequest(
                    user.getId(),
                    name,
                    user.getEmail(),
                    user.getUsername(),
                    false
            );
            userService.createUserProfile(request);
            log.debug("User profile created for: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to create user profile for: {}", user.getEmail(), e);
            throw new BadRequestException(ApiResponseCode.INTERNAL_ERROR, "Failed to create user profile");
        }
    }

    private void sendVerificationEmail(User user) {
        try {
            // Generate verification OTP
            String otp = generateVerificationToken(user.getEmail());

            // Send email with OTP code
            String verificationLink = Constants.VERIFICATION_EMAIL_URL + otp;
            EmailVerificationRequest emailRequest = EmailVerificationRequest.builder()
                    .to(user.getEmail())
                    .userName(user.getUsername())
                    .verificationLink(verificationLink)
                    .otpCode(otp)
                    .build();

            notificationService.sendEmail(emailRequest);
            log.info("Verification email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", user.getEmail(), e);
            // Don't fail registration if email sending fails
        }
    }


    private String generateVerificationToken(String email) {
        LocalDateTime expTime = LocalDateTime.now().plusMinutes(3);
        String otp = RandomStringUtils.secureStrong().nextAlphanumeric(Constants.OTP_LENGTH);
        String hashedOtp = hashingHelper.createHashWithSecretKey(otp);

        confirmationEmailRepo.generateVerificationEmail(email, hashedOtp, expTime);

        log.debug("Verification token generated for: {}", email);
        return otp; // Return plain OTP instead of hashed version
    }

    private void validateVerificationToken(ConfirmationEmail confirmationEmail) {
        if (confirmationEmail.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException(ApiResponseCode.VERIFICATION_TOKEN_EXPIRED);
        }

        if (confirmationEmail.isRevoked()) {
            throw new BadRequestException(ApiResponseCode.INVALID_VERIFICATION_TOKEN);
        }
    }

    private void sendPasswordResetEmail(User user, String resetToken) {
        try {
            String resetLink = Constants.PASSWORD_RESET_URL + resetToken;
            PasswordResetEmailRequest emailRequest = PasswordResetEmailRequest.builder()
                    .to(user.getEmail())
                    .userName(user.getUsername())
                    .resetLink(resetLink)
                    .build();

            notificationService.sendEmail(emailRequest);
            log.info("Password reset email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", user.getEmail(), e);
        }
    }

    private String generateUniqueUsername(String name) {
        String baseUsername = name.toLowerCase()
                .replaceAll("[^a-z0-9]", "")
                .trim();

        if (baseUsername.isEmpty()) {
            baseUsername = "user";
        }

        String username = baseUsername;
        int attempts = 0;

        while (userRepo.findByUsername(username).isPresent() && attempts < 100) {
            username = baseUsername + RandomStringUtils.secureStrong().nextNumeric(4);
            attempts++;
        }

        if (attempts >= 100) {
            throw new BadRequestException(ApiResponseCode.INTERNAL_ERROR, "Failed to generate unique username");
        }

        return username;
    }




    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) {
                return "unknown";
            }

            HttpServletRequest request = attributes.getRequest();

            // Check X-Forwarded-For header
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }

            // Check X-Real-IP header
            String xRealIp = request.getHeader("X-Real-IP");
            if (xRealIp != null && !xRealIp.isEmpty()) {
                return xRealIp;
            }

            return request.getRemoteAddr();
        } catch (Exception e) {
            log.debug("Could not extract client IP address: {}", e.getMessage());
            return "unknown";
        }
    }
}
