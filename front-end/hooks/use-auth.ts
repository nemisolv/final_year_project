import { useContext } from 'react';
import { AuthContext } from '@/components/features/auth/auth-provider';

/**
 * Hook to access authentication context
 * Provides user data, loading state, and auth methods
 *
 * @example
 * const { user, isLoading, fetchUser, refreshUser } = useAuth();
 *
 * // User is already cached, no API call on navigation
 * if (user) {
 *   console.log(user.email);
 * }
 *
 * // Force refresh if needed
 * await refreshUser();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
