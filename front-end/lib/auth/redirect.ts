import { User } from '@/types';

/**
 * Determine redirect path after successful login based on user data
 * @param user - Logged in user data
 * @returns Redirect path
 */
export function getLoginRedirectPath(user: User): string {
  // Check onboarding status first
  if (!user.isOnboarded) {
    return '/onboarding';
  }

  // Redirect based on user role
  // Admin users go to admin dashboard
  if (user.roles && user.roles.includes('ADMIN')) {
    return '/admin';
  }

  // Default redirect to user dashboard
  return '/dashboard';
}

/**
 * Get default redirect path for role
 * @param role - User role
 * @returns Default path for the role
 */
export function getRoleDefaultPath(role: string): string {
  const rolePathMap: Record<string, string> = {
    ADMIN: '/admin',
    USER: '/dashboard',
  };

  return rolePathMap[role] || '/dashboard';
}
