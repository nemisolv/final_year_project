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

// Learning-specific menu items
export const LEARNING_MENU_ITEMS: UserDropdownMenuItem[] = [
  {
    label: 'Học tập',
    icon: GraduationCap,
    href: '/learning',
  },
  {
    label: 'Khóa học của tôi',
    icon: BookOpen,
    href: '/learning/courses',
  },
  {
    label: 'Tiến độ',
    icon: LayoutDashboard,
    href: '/learning/progress',
  },
];

// Admin-specific menu items (requires admin role)
export const ADMIN_MENU_ITEMS: UserDropdownMenuItem[] = [
  {
    label: 'Quản trị hệ thống',
    icon: Shield,
    href: '/management',
    requiredRoles: ['ROLE_ADMIN', 'ADMIN'],
  },
];

// Marketing page menu items
export const MARKETING_MENU_ITEMS: UserDropdownMenuItem[] = [
  {
    label: 'Vào học',
    icon: GraduationCap,
    href: '/learning',
  },
];

/**
 * Preset configurations for different page contexts
 */
export const USER_MENU_PRESETS = {
  // For marketing/landing pages
  marketing: [...ADMIN_MENU_ITEMS, ...MARKETING_MENU_ITEMS],

  // For learning pages
  learning: [...ADMIN_MENU_ITEMS, ...LEARNING_MENU_ITEMS, ...COMMON_MENU_ITEMS],

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
