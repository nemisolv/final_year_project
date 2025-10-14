import { User } from './user';

// Authentication Response from API
export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
  scopes?: Record<string, string[]>; // Role -> Permissions mapping
  user?: User; // Optional user data included in response
}

// Login Request
export interface LoginCredentials {
  email: string;
  password: string;
}

// Register Request
export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// Auth Context Type
export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  refreshUser: () => Promise<User | null>;
  fetchUser: (force?: boolean) => Promise<User | null>;
}

// Password Reset Request
export interface PasswordResetRequest {
  email: string;
}

// Password Reset Confirm
export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

// Email Verification Request
export interface EmailVerificationRequest {
  token: string;
}

// Logout Request
export interface LogoutRequest {
  refreshToken: string;
}

// Token Refresh Response
export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}
