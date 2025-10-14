import { apiClient } from '@/lib/api/client';
import { apiConfig } from '@/config';
import {
  AuthenticationResponse,
  LoginCredentials,
  RegisterData,
  PasswordResetRequest,
  PasswordResetConfirm,
  EmailVerificationRequest,
  LogoutRequest,
} from '@/types';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export class AuthService {
  /**
   * Login user with email and password
   * @param credentials - User login credentials (email, password)
   * @returns Authentication response with tokens and scopes
   */
  async login(credentials: LoginCredentials): Promise<AuthenticationResponse> {
    const response = await apiClient.post<AuthenticationResponse>(
      apiConfig.endpoints.auth.login,
      credentials
    );

    // Store tokens and scopes (permissions) in localStorage
    if (response) {
      apiClient.setTokens(
        response.accessToken,
        response.refreshToken,
        response.scopes
      );
    }

    return response;
  }

  /**
   * Register new user
   * @param data - Registration data (email, password, name)
   */
  async register(data: RegisterData): Promise<void> {
    await apiClient.post<void>(apiConfig.endpoints.auth.signup, data);
  }

  /**
   * Logout current user
   * Invalidates refresh token on server and clears local storage
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = typeof window !== 'undefined'
        ? localStorage.getItem('refreshToken')
        : null;

      if (refreshToken) {
        await apiClient.post<void>(apiConfig.endpoints.auth.logout, {
          refreshToken,
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue to clear tokens even if API call fails
    } finally {
      apiClient.clearTokens();
    }
  }

  /**
   * Logout from all devices
   * Invalidates all refresh tokens for the user
   */
  async logoutAllDevices(): Promise<void> {
    try {
      await apiClient.post<void>(apiConfig.endpoints.auth.logoutAllDevices);
    } catch (error) {
      console.error('Logout all devices API call failed:', error);
      throw error;
    } finally {
      // Clear tokens on current device
      apiClient.clearTokens();
    }
  }

  /**
   * Verify user email with token
   * @param token - Email verification token
   */
  async verifyEmail(token: string): Promise<void> {
    await apiClient.post<void>(apiConfig.endpoints.auth.verifyEmail, { token });
  }

  /**
   * Request password reset
   * Sends reset link to user's email
   * @param data - Email address
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    await apiClient.post<void>(apiConfig.endpoints.auth.forgotPassword, data);
  }

  /**
   * Confirm password reset with token
   * @param data - Reset token and new password
   */
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    await apiClient.post<void>(apiConfig.endpoints.auth.resetPassword, data);
  }

  /**
   * Resend verification email
   * @param email - User email address
   */
  async resendVerificationEmail(email: string): Promise<void> {
    await apiClient.post<void>(apiConfig.endpoints.auth.resendMail, { email });
  }
}

// Export singleton instance
export const authService = new AuthService();
