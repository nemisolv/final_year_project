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
  // Admin users go to management dashboard
  if (user.roles && user.roles.includes('ADMIN')) {
    return '/management';
  }

  // Default redirect to user learning page
  return '/learning';
}

/**
 * Get default redirect path for role
 * @param role - User role
 * @returns Default path for the role
 */
export function getRoleDefaultPath(role: string): string {
  const rolePathMap: Record<string, string> = {
    ADMIN: '/management',
    USER: '/learning',
  };

  return rolePathMap[role] || '/learning';
}
