# UserDropdown - Quick Reference

## Import
```tsx
import { UserDropdown } from '@/components/features/user';
import { USER_MENU_PRESETS } from '@/config/user-menu.config';
```

## Basic Usage

### Use Preset
```tsx
<UserDropdown menuItems={USER_MENU_PRESETS.marketing} />
<UserDropdown menuItems={USER_MENU_PRESETS.dashboard} />
<UserDropdown menuItems={USER_MENU_PRESETS.learning} />
<UserDropdown menuItems={USER_MENU_PRESETS.minimal} />
```

### Custom Items
```tsx
const items = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    label: 'Settings',
    icon: Settings,
    onClick: () => openSettings(),
  },
];

<UserDropdown menuItems={items} />
```

### Admin-Only Item
```tsx
{
  label: 'Trang quản trị',
  icon: Shield,
  href: '/admin',
  requiredRoles: ['ROLE_ADMIN', 'ADMIN'], // ← Only admins see this
}
```

### Separator
```tsx
{ label: 'separator' }
```

### Dialog Integration
```tsx
{
  label: 'Settings',
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
}
```

## Props

| Prop | Type | Default | Required |
|------|------|---------|----------|
| `menuItems` | `UserDropdownMenuItem[]` | `[]` | Yes |
| `showUserInfo` | `boolean` | `true` | No |
| `align` | `'start' \| 'center' \| 'end'` | `'end'` | No |
| `className` | `string` | - | No |
| `contentClassName` | `string` | - | No |

## Menu Item Properties

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Display text |
| `href` | `string` | Link URL |
| `icon` | `LucideIcon` | Icon component |
| `onClick` | `() => void` | Click handler |
| `requiredRoles` | `string[]` | Required user roles |
| `className` | `string` | CSS classes |
| `customContent` | `ReactNode` | Custom component |

## Available Presets

### Marketing
- Trang quản trị (admin only)
- Trang quản lí
- Lộ trình học

### Dashboard
- Trang quản trị (admin only)
- Dashboard
- Lộ trình học
- Tiến độ của tôi
- Thông tin cá nhân
- Cài đặt

### Learning
- Trang quản trị (admin only)
- Dashboard
- Lộ trình học
- Tiến độ của tôi

### Minimal
- Trang quản trị (admin only)
- Thông tin cá nhân
- Cài đặt

## Complete Example

```tsx
import { UserDropdown } from '@/components/features/user';
import { USER_MENU_PRESETS } from '@/config/user-menu.config';
import { UserSettingsDialog } from '@/components/features/user';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Settings } from 'lucide-react';

export function Header() {
  const { user } = useAuth();

  const customItems = user ? [
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
    <header>
      <UserDropdown
        menuItems={[...customItems, ...USER_MENU_PRESETS.dashboard]}
      />
    </header>
  );
}
```

## Role-Based Behavior

### Regular User Sees:
```
✓ Dashboard
✓ Lộ trình học
✓ Settings
✓ Logout
✗ Trang quản trị (hidden)
```

### Admin User Sees:
```
✓ Trang quản trị (visible)
✓ Dashboard
✓ Lộ trình học
✓ Settings
✓ Logout
```

## Tips

1. **Always specify requiredRoles** for admin-only items
2. **Use customContent** for dialogs to prevent dropdown closing
3. **Add separators** to group related items
4. **Use presets** for consistency across pages
5. **Combine presets** with custom items using spread operator
