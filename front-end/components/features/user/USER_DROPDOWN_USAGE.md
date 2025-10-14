# UserDropdown Component Usage Guide

The `UserDropdown` component is a reusable, role-based user menu dropdown that provides consistent user navigation across the application.

## Features

- **Role-based menu items**: Automatically shows/hides menu items based on user roles
- **Flexible configuration**: Use preset configurations or custom menu items
- **Custom content support**: Integrate dialogs and other components
- **Consistent styling**: Maintains design consistency across the app
- **Type-safe**: Full TypeScript support

## Basic Usage

```tsx
import { UserDropdown } from '@/components/features/user';
import { USER_MENU_PRESETS } from '@/config/user-menu.config';

function MyHeader() {
  return (
    <header>
      <UserDropdown menuItems={USER_MENU_PRESETS.dashboard} />
    </header>
  );
}
```

## Available Presets

The `USER_MENU_PRESETS` provides pre-configured menu configurations:

### 1. Marketing Preset
For marketing/landing pages:
```tsx
<UserDropdown menuItems={USER_MENU_PRESETS.marketing} />
```
Includes:
- Trang quản trị (admin only)
- Trang quản lí (Dashboard)
- Lộ trình học (Learning Path)

### 2. Dashboard Preset
For dashboard pages:
```tsx
<UserDropdown menuItems={USER_MENU_PRESETS.dashboard} />
```
Includes:
- Trang quản trị (admin only)
- Dashboard
- Lộ trình học
- Tiến độ của tôi
- Thông tin cá nhân
- Cài đặt

### 3. Learning Preset
For learning pages:
```tsx
<UserDropdown menuItems={USER_MENU_PRESETS.learning} />
```
Includes:
- Trang quản trị (admin only)
- Dashboard
- Lộ trình học
- Tiến độ của tôi

### 4. Minimal Preset
Minimal menu with just essentials:
```tsx
<UserDropdown menuItems={USER_MENU_PRESETS.minimal} />
```
Includes:
- Trang quản trị (admin only)
- Thông tin cá nhân
- Cài đặt

## Custom Menu Items

You can create custom menu items:

```tsx
import { UserDropdown, UserDropdownMenuItem } from '@/components/features/user';
import { BookOpen, Settings } from 'lucide-react';

const customItems: UserDropdownMenuItem[] = [
  {
    label: 'My Courses',
    icon: BookOpen,
    href: '/my-courses',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    requiredRoles: ['ROLE_USER', 'ROLE_ADMIN'],
  },
];

<UserDropdown menuItems={customItems} />
```

## Integrating Dialogs

You can integrate dialog components as custom content:

```tsx
import { UserDropdown } from '@/components/features/user';
import { UserSettingsDialog } from '@/components/features/user';
import { USER_MENU_PRESETS } from '@/config/user-menu.config';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Settings } from 'lucide-react';

function MyHeader() {
  const { user } = useAuth();

  const customMenuItems = user ? [
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
  ] : [];

  return (
    <UserDropdown
      menuItems={[...USER_MENU_PRESETS.dashboard, ...customMenuItems]}
    />
  );
}
```

## Menu Item Types

### Link Item
```tsx
{
  label: 'Dashboard',
  icon: LayoutDashboard,
  href: '/dashboard',
}
```

### onClick Item
```tsx
{
  label: 'Download Data',
  icon: Download,
  onClick: () => downloadUserData(),
}
```

### Role-based Item (Admin Only)
```tsx
{
  label: 'Trang quản trị',
  icon: Shield,
  href: '/admin',
  requiredRoles: ['ROLE_ADMIN', 'ADMIN'],
}
```

### Separator
```tsx
{
  label: 'separator',
}
```

### Custom Content (Dialog)
```tsx
{
  label: 'Settings',
  customContent: (
    <UserSettingsDialog
      user={user}
      trigger={<DropdownMenuItem>...</DropdownMenuItem>}
    />
  ),
}
```

## Props

### UserDropdownProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `menuItems` | `UserDropdownMenuItem[]` | `[]` | Array of menu items to display |
| `showUserInfo` | `boolean` | `true` | Show user name and email in header |
| `align` | `'start' \| 'center' \| 'end'` | `'end'` | Alignment of dropdown menu |
| `className` | `string` | - | Additional CSS classes for trigger button |
| `contentClassName` | `string` | - | Additional CSS classes for dropdown content |

### UserDropdownMenuItem

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Display label (use 'separator' for separator) |
| `href` | `string` | Link URL (for link items) |
| `icon` | `LucideIcon` | Icon component from lucide-react |
| `onClick` | `() => void` | Click handler (for action items) |
| `requiredRoles` | `string[]` | Required roles to see this item |
| `className` | `string` | Additional CSS classes |
| `customContent` | `ReactNode` | Custom React component (overrides default rendering) |
| `preventSelect` | `boolean` | Prevent dropdown from closing on select |

## Advanced Usage

### Building Custom Menu Items

Use the `buildMenuItems` helper to combine presets with custom items:

```tsx
import { buildMenuItems } from '@/config/user-menu.config';

const customItems: UserDropdownMenuItem[] = [
  { label: 'Custom Item', href: '/custom' },
];

<UserDropdown menuItems={buildMenuItems('dashboard', customItems)} />
```

### Hiding User Info

```tsx
<UserDropdown
  menuItems={USER_MENU_PRESETS.minimal}
  showUserInfo={false}
/>
```

### Custom Alignment

```tsx
<UserDropdown
  menuItems={USER_MENU_PRESETS.dashboard}
  align="start"
/>
```

## Role-Based Access Control

The component automatically filters menu items based on the current user's roles using the `hasAnyRole` function from the auth context.

If `requiredRoles` is not specified or is empty, the item is visible to all authenticated users.

Example:
```tsx
{
  label: 'Admin Panel',
  href: '/admin',
  requiredRoles: ['ROLE_ADMIN', 'ADMIN'], // Only visible to admins
}
```

## Examples

### Marketing Page Header
```tsx
import { UserDropdown } from '@/components/features/user';
import { USER_MENU_PRESETS } from '@/config/user-menu.config';

export function MarketingHeader() {
  const { isAuthenticated } = useAuth();

  return (
    <header>
      {isAuthenticated ? (
        <UserDropdown menuItems={USER_MENU_PRESETS.marketing} />
      ) : (
        <LoginButton />
      )}
    </header>
  );
}
```

### Dashboard with Profile Dialog
```tsx
import { UserDropdown } from '@/components/features/user';
import { UserProfileDialog } from '@/components/features/user/user-profile-dialog';
import { USER_MENU_PRESETS } from '@/config/user-menu.config';
import { User as UserIcon } from 'lucide-react';

export function DashboardHeader() {
  const { user, setUser } = useAuth();

  const customMenuItems = user ? [
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
  ] : [];

  return (
    <UserDropdown
      menuItems={[...customMenuItems, ...USER_MENU_PRESETS.dashboard]}
    />
  );
}
```

## Notes

- The logout button is automatically added at the bottom of every dropdown
- All menu items are type-safe with TypeScript
- The component handles null/undefined user gracefully
- Icon components should be imported from `lucide-react`
