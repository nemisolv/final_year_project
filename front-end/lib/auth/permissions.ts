import { User } from '@/types';
import { apiClient } from '@/lib/api/client';

/**
 * Permission helper functions
 * Supports checking permissions from both User object and localStorage
 */

/**
 * Get roles from scopes object
 * Scopes format: { "ADMIN": ["course.create", ...], "USER": [...] }
 */
export function getRolesFromScopes(scopes?: Record<string, string[]> | null): string[] {
  if (!scopes) return [];
  return Object.keys(scopes);
}

/**
 * Get all permissions/scopes from user or localStorage
 */
export function getPermissions(user?: User | null): Record<string, string[]> | null {
  // Try to get from user object first
  if (user?.permissions) {
    return user.permissions;
  }

  // Fallback to localStorage
  return apiClient.getUserScopes();
}

/**
 * Get all permissions for a specific role
 */
export function getRolePermissions(role: string, user?: User | null): string[] {
  const permissions = getPermissions(user);
  if (!permissions) return [];

  return permissions[role] || [];
}

/**
 * Check if user has a specific permission
 * @param permission - Permission string (e.g., "course.create", "user.delete")
 * @param user - User object (optional, will use localStorage if not provided)
 */
export function hasPermission(permission: string, user?: User | null): boolean {
  const permissions = getPermissions(user);
  if (!permissions) return false;

  // Check across all roles
  return Object.values(permissions).some((rolePermissions) =>
    rolePermissions.includes(permission)
  );
}

/**
 * Check if user has ANY of the specified permissions
 */
export function hasAnyPermission(permissions: string[], user?: User | null): boolean {
  return permissions.some((permission) => hasPermission(permission, user));
}

/**
 * Check if user has ALL of the specified permissions
 */
export function hasAllPermissions(permissions: string[], user?: User | null): boolean {
  return permissions.every((permission) => hasPermission(permission, user));
}

/**
 * Check if user has permissions for a specific resource action
 * @param resource - Resource name (e.g., "course", "user", "lesson")
 * @param action - Action name (e.g., "create", "read", "update", "delete")
 */
export function hasResourcePermission(
  resource: string,
  action: string,
  user?: User | null
): boolean {
  const permissionString = `${resource}.${action}`;
  return hasPermission(permissionString, user);
}

/**
 * Get all permissions as a flat array (for debugging/display)
 */
export function getAllPermissions(user?: User | null): string[] {
  const permissions = getPermissions(user);
  if (!permissions) return [];

  const allPerms = new Set<string>();
  Object.values(permissions).forEach((rolePermissions) => {
    rolePermissions.forEach((perm) => allPerms.add(perm));
  });

  return Array.from(allPerms);
}

/**
 * Check if user has admin permissions (all system permissions)
 */
export function isAdmin(user?: User | null): boolean {
  const permissions = getPermissions(user);
  if (!permissions) return false;

  // Check if user has ADMIN role with permissions
  const adminPerms = permissions['ADMIN'];
  return adminPerms && adminPerms.length > 0;
}

/**
 * Get permission categories grouped by resource
 */
export function getPermissionsByResource(user?: User | null): Record<string, string[]> {
  const allPermissions = getAllPermissions(user);
  const grouped: Record<string, string[]> = {};

  allPermissions.forEach((permission) => {
    const [resource, action] = permission.split('.');
    if (resource && action) {
      if (!grouped[resource]) {
        grouped[resource] = [];
      }
      grouped[resource].push(action);
    }
  });

  return grouped;
}