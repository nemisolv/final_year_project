import { apiClient } from '@/lib/api/client';
import { apiConfig } from '@/config';
import {
  AuthenticationResponse,
  LoginCredentials,
  RegisterData,
  PasswordResetRequest,
  PasswordResetConfirm,
} from '@/types';

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthenticationResponse> {
    const response = await apiClient.post<AuthenticationResponse>(
      apiConfig.endpoints.auth.login,
      credentials
    );

    // Store tokens and permissions
    if (response) {
      apiClient.setTokens(
        response.access_token,
        response.refresh_token,
        response.roles
      );
    }

    return response;
  }

  async register(data: RegisterData): Promise<void> {
    await apiClient.post<void>(apiConfig.endpoints.auth.signup, data);
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = typeof window !== 'undefined'
        ? localStorage.getItem('refreshToken')
        : null;

      if (refreshToken) {
        await apiClient.post<void>(apiConfig.endpoints.auth.logout, {
          refresh_token: refreshToken,
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      apiClient.clearTokens();
    }
  }

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

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post<void>(apiConfig.endpoints.auth.verifyEmail, { token });
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    await apiClient.post<void>(apiConfig.endpoints.auth.forgotPassword, data);
  }

  async confirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    await apiClient.post<void>(apiConfig.endpoints.auth.resetPassword, data);
  }

  async resendVerificationEmail(email: string): Promise<void> {
    await apiClient.post<void>(apiConfig.endpoints.auth.resendMail, { email });
  }
}

export const authService = new AuthService();
