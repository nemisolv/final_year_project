/**
 * UserDropdown Component Examples
 *
 * This file demonstrates various ways to use the UserDropdown component
 * with role-based menu items.
 */

import { UserDropdown } from './user-dropdown';
import { USER_MENU_PRESETS, buildMenuItems } from '@/config/user-menu.config';
import { UserProfileDialog } from './user-profile-dialog';
import { UserSettingsDialog } from './user-settings-dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { User as UserIcon, Settings, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks';

// ============================================
// Example 1: Basic Usage with Marketing Preset
// ============================================
export function MarketingHeaderExample() {
  const { isAuthenticated } = useAuth();

  return (
    <header>
      {isAuthenticated && (
        <UserDropdown menuItems={USER_MENU_PRESETS.marketing} />
      )}
    </header>
  );
}

// ============================================
// Example 2: Dashboard with Role-Based Items
// ============================================
// This will automatically show "Trang quản trị" only to admins
export function DashboardHeaderExample() {
  return (
    <header>
      <UserDropdown menuItems={USER_MENU_PRESETS.dashboard} />
    </header>
  );
}

// ============================================
// Example 3: Custom Menu Items with Roles
// ============================================
export function CustomRoleBasedExample() {
  const customItems = [
    {
      label: 'User Dashboard',
      icon: BookOpen,
      href: '/user/dashboard',
      requiredRoles: ['ROLE_USER'], // Only users see this
    },
    {
      label: 'Admin Panel',
      icon: Settings,
      href: '/admin',
      requiredRoles: ['ROLE_ADMIN', 'ADMIN'], // Only admins see this
    },
    {
      label: 'Teacher Tools',
      icon: BookOpen,
      href: '/teacher',
      requiredRoles: ['ROLE_TEACHER'], // Only teachers see this
    },
  ];

  return <UserDropdown menuItems={customItems} />;
}

// ============================================
// Example 4: Integrating Dialog Components
// ============================================
export function DialogIntegrationExample() {
  const { user, setUser } = useAuth();

  const menuItemsWithDialog = user ? [
    {
      label: 'My Profile',
      icon: UserIcon,
      customContent: (
        <UserProfileDialog
          user={user}
          onUserUpdate={(updatedUser) => setUser(updatedUser)}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <UserIcon className="mr-2 h-4 w-4" />
              My Profile
            </DropdownMenuItem>
          }
        />
      ),
    },
    {
      label: 'Settings',
      icon: Settings,
      customContent: (
        <UserSettingsDialog
          user={user}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
          }
        />
      ),
    },
    { label: 'separator' },
    ...USER_MENU_PRESETS.dashboard,
  ] : [];

  return <UserDropdown menuItems={menuItemsWithDialog} />;
}

// ============================================
// Example 5: Mixed Roles and Custom Items
// ============================================
export function CompleteExample() {
  const { user, setUser } = useAuth();

  const customItems = user ? [
    // Profile dialog (available to all)
    {
      label: 'My Profile',
      icon: UserIcon,
      customContent: (
        <UserProfileDialog
          user={user}
          onUserUpdate={setUser}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <UserIcon className="mr-2 h-4 w-4" />
              My Profile
            </DropdownMenuItem>
          }
        />
      ),
    },
    { label: 'separator' },
    // Regular links
    {
      label: 'My Courses',
      icon: BookOpen,
      href: '/my-courses',
    },
    // Admin-only items
    {
      label: 'Admin Dashboard',
      icon: Settings,
      href: '/admin',
      requiredRoles: ['ROLE_ADMIN', 'ADMIN'],
    },
    {
      label: 'User Management',
      icon: UserIcon,
      href: '/admin/users',
      requiredRoles: ['ROLE_ADMIN'],
    },
  ] : [];

  return <UserDropdown menuItems={customItems} />;
}

// ============================================
// Example 6: Using buildMenuItems Helper
// ============================================
export function BuildMenuItemsExample() {
  const customItems = [
    {
      label: 'Custom Item 1',
      href: '/custom-1',
    },
    {
      label: 'Custom Item 2',
      href: '/custom-2',
    },
  ];

  return (
    <UserDropdown
      menuItems={buildMenuItems('dashboard', customItems)}
    />
  );
}

// ============================================
// Example 7: Different Alignments and Styling
// ============================================
export function StyledExample() {
  return (
    <div className="flex gap-4">
      {/* Left aligned */}
      <UserDropdown
        menuItems={USER_MENU_PRESETS.minimal}
        align="start"
        className="border-2 border-primary"
        contentClassName="bg-accent"
      />

      {/* Center aligned */}
      <UserDropdown
        menuItems={USER_MENU_PRESETS.minimal}
        align="center"
      />

      {/* Right aligned (default) */}
      <UserDropdown
        menuItems={USER_MENU_PRESETS.minimal}
        align="end"
      />
    </div>
  );
}

// ============================================
// Example 8: Hide User Info
// ============================================
export function MinimalExample() {
  return (
    <UserDropdown
      menuItems={USER_MENU_PRESETS.minimal}
      showUserInfo={false}
    />
  );
}

// ============================================
// Example 9: Role-Based Rendering Test
// ============================================
// This example shows how different users see different menus
export function RoleTestExample() {
  // Test scenarios:
  // 1. Regular user (ROLE_USER) will see:
  //    - Dashboard
  //    - Learning Path
  //    - My Progress
  //    - Profile
  //    - Settings
  //
  // 2. Admin user (ROLE_ADMIN) will see all of the above PLUS:
  //    - Trang quản trị (Admin Panel)
  //
  // 3. Teacher user (ROLE_TEACHER) will see user items PLUS:
  //    - Teacher specific items (if configured)

  const menuItems = [
    // Visible to all authenticated users
    {
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      label: 'separator',
    },
    // Admin only
    {
      label: 'Trang quản trị',
      href: '/admin',
      requiredRoles: ['ROLE_ADMIN', 'ADMIN'],
    },
    // Teacher only
    {
      label: 'Teacher Dashboard',
      href: '/teacher',
      requiredRoles: ['ROLE_TEACHER'],
    },
    // Both admin and teacher
    {
      label: 'Analytics',
      href: '/analytics',
      requiredRoles: ['ROLE_ADMIN', 'ROLE_TEACHER'],
    },
    {
      label: 'separator',
    },
    // Visible to all
    {
      label: 'Settings',
      href: '/settings',
    },
  ];

  return <UserDropdown menuItems={menuItems} />;
}
