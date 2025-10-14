import { BookOpen, Settings, User as UserIcon, LayoutDashboard, GraduationCap, Shield } from 'lucide-react';
import { UserDropdownMenuItem } from '@/components/features/user';

/**
 * Configuration for user dropdown menu items based on different contexts
 */

// Common menu items
export const COMMON_MENU_ITEMS: UserDropdownMenuItem[] = [
  {
    label: 'Thông tin cá nhân',
    icon: UserIcon,
    href: '/profile',
  },
  {
    label: 'Cài đặt',
    icon: Settings,
    href: '/settings',
  },
];

// Dashboard-specific menu items
export const DASHBOARD_MENU_ITEMS: UserDropdownMenuItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    label: 'Lộ trình học',
    icon: BookOpen,
    href: '/learning/path',
  },
  {
    label: 'Tiến độ của tôi',
    icon: GraduationCap,
    href: '/learning/progress',
  },
];

// Admin-specific menu items (requires admin role)
export const ADMIN_MENU_ITEMS: UserDropdownMenuItem[] = [
  {
    label: 'Trang quản trị',
    icon: Shield,
    href: '/admin',
    requiredRoles: ['ROLE_ADMIN', 'ADMIN'],
  },
];

// Marketing page menu items
export const MARKETING_MENU_ITEMS: UserDropdownMenuItem[] = [
  {
    label: 'Trang quản lí',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    label: 'Lộ trình học',
    icon: BookOpen,
    href: '/learning/path',
  },
];

/**
 * Preset configurations for different page contexts
 */
export const USER_MENU_PRESETS = {
  // For marketing/landing pages
  marketing: [...ADMIN_MENU_ITEMS, ...MARKETING_MENU_ITEMS],

  // For dashboard pages
  dashboard: [...ADMIN_MENU_ITEMS, ...DASHBOARD_MENU_ITEMS, ...COMMON_MENU_ITEMS],

  // For learning pages
  learning: [...ADMIN_MENU_ITEMS, ...DASHBOARD_MENU_ITEMS],

  // Minimal menu with just admin link and settings
  minimal: [...ADMIN_MENU_ITEMS, ...COMMON_MENU_ITEMS],
} as const;

/**
 * Helper function to get menu items with custom items inserted
 */
export function buildMenuItems(
  preset: keyof typeof USER_MENU_PRESETS,
  customItems?: UserDropdownMenuItem[]
): UserDropdownMenuItem[] {
  const baseItems = USER_MENU_PRESETS[preset];

  if (!customItems || customItems.length === 0) {
    return baseItems;
  }

  return [...customItems, { label: 'separator' }, ...baseItems];
}
