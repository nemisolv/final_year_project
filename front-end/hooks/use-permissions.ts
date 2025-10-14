import { useAuth } from './use-auth';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasResourcePermission,
  getAllPermissions,
  getPermissionsByResource,
  isAdmin,
} from '@/lib/auth/permissions';

/**
 * Hook to check user permissions
 *
 * @example
 * ```tsx
 * const { hasPermission, hasAnyPermission, isAdmin } = usePermissions();
 *
 * if (hasPermission('course.create')) {
 *   // Show create course button
 * }
 *
 * if (hasAnyPermission(['user.create', 'user.update'])) {
 *   // Show user management section
 * }
 *
 * if (isAdmin()) {
 *   // Show admin panel
 * }
 * ```
 */
export function usePermissions() {
  const { user } = useAuth();

  return {
    /**
     * Check if user has a specific permission
     * @example hasPermission('course.create')
     */
    hasPermission: (permission: string) => hasPermission(permission, user),

    /**
     * Check if user has ANY of the specified permissions
     * @example hasAnyPermission(['course.create', 'course.update'])
     */
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(permissions, user),

    /**
     * Check if user has ALL of the specified permissions
     * @example hasAllPermissions(['course.create', 'course.read'])
     */
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(permissions, user),

    /**
     * Check if user has permission for a specific resource action
     * @example hasResourcePermission('course', 'create')
     */
    hasResourcePermission: (resource: string, action: string) =>
      hasResourcePermission(resource, action, user),

    /**
     * Get all permissions as a flat array
     */
    getAllPermissions: () => getAllPermissions(user),

    /**
     * Get permissions grouped by resource
     * @example { course: ['create', 'read', 'update'], user: ['read'] }
     */
    getPermissionsByResource: () => getPermissionsByResource(user),

    /**
     * Check if user is admin
     */
    isAdmin: () => isAdmin(user),
  };
}