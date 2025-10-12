# User Settings Dialog Usage

## Overview

A comprehensive user settings dialog component with three tabs:
1. **Profile** - Personal information
2. **Learning** - Learning preferences and goals
3. **Privacy** - Notification and privacy settings

## Features

- Tabbed interface for organized settings
- Real-time form validation
- Loading states during updates
- Toast notifications for success/error
- Responsive design
- Accessible (keyboard navigation, ARIA labels)

## Import

```typescript
import { UserSettingsDialog } from '@/components/features/user';
```

## Basic Usage

### With Default Trigger

```typescript
import { UserSettingsDialog } from '@/components/features/user';
import { useUser } from '@/hooks';

function MyComponent() {
  const { user, refetch } = useUser();

  if (!user) return null;

  return (
    <UserSettingsDialog
      user={user}
      onUserUpdate={(updatedUser) => {
        console.log('User updated:', updatedUser);
        refetch(); // Refresh user data
      }}
    />
  );
}
```

### With Custom Trigger

```typescript
import { UserSettingsDialog } from '@/components/features/user';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

function UserMenu() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <UserSettingsDialog
      user={user}
      onUserUpdate={(updatedUser) => {
        // Handle update
      }}
      trigger={
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      }
    />
  );
}
```

## Props

```typescript
interface UserSettingsDialogProps {
  user: User;                                    // Required: Current user data
  onUserUpdate?: (user: User) => void;          // Optional: Callback after update
  trigger?: React.ReactNode;                     // Optional: Custom trigger button
}
```

## Form Fields

### Profile Tab
- **Name** (Họ và tên) - Text input
- **Username** (Tên người dùng) - Text input
- **Email** - Disabled (cannot be changed)
- **Date of Birth** (Ngày sinh) - Date picker

### Learning Tab
- **English Level** (Trình độ) - Dropdown
  - Beginner
  - Elementary
  - Intermediate
  - Upper Intermediate
  - Advanced
- **Learning Goals** (Mục tiêu) - Dropdown
  - IELTS Preparation
  - TOEFL Preparation
  - Business English
  - Travel English
  - Conversation Practice
  - General Improvement
- **Preferred Accent** (Giọng phát âm) - Dropdown
  - American
  - British
  - Australian
  - Canadian
- **Daily Study Goal** (Mục tiêu hàng ngày) - Number input (5-300 minutes)

### Privacy Tab
- **Notifications** (Thông báo) - Toggle switch
- **Privacy Level** (Mức độ riêng tư) - Dropdown
  - Public
  - Friends Only
  - Private

## Examples

### In Dashboard Header

```typescript
// components/features/dashboard/dashboard-header.tsx
import { UserSettingsDialog } from '@/components/features/user';
import { useAuth } from '@/hooks';

export function DashboardHeader() {
  const { user } = useAuth();

  return (
    <header>
      <nav>
        {/* ... other nav items ... */}
        {user && (
          <UserSettingsDialog
            user={user}
            trigger={
              <button className="avatar-button">
                {user.name?.[0]}
              </button>
            }
          />
        )}
      </nav>
    </header>
  );
}
```

### In User Profile Page

```typescript
// app/profile/page.tsx
'use client';

import { UserSettingsDialog } from '@/components/features/user';
import { useUser } from '@/hooks';
import { Settings } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading, refetch } = useUser();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <NotFound />;

  return (
    <div>
      <div className="profile-header">
        <h1>{user.name}</h1>
        <UserSettingsDialog
          user={user}
          onUserUpdate={refetch}
          trigger={
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          }
        />
      </div>
      {/* ... rest of profile ... */}
    </div>
  );
}
```

### In Dropdown Menu

```typescript
import { UserSettingsDialog } from '@/components/features/user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function UserDropdown({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>...</DropdownMenuTrigger>
      <DropdownMenuContent>
        <UserSettingsDialog
          user={user}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Handling Updates

The dialog automatically handles:
- Form submission
- Loading states
- Error handling
- Toast notifications

You can optionally provide an `onUserUpdate` callback to:
- Refresh the user data in your app state
- Update the UI
- Trigger additional actions

```typescript
<UserSettingsDialog
  user={user}
  onUserUpdate={(updatedUser) => {
    // Option 1: Update local state
    setUser(updatedUser);

    // Option 2: Refetch from server
    refetch();

    // Option 3: Update context
    updateUserInContext(updatedUser);

    // Option 4: Custom action
    trackUserUpdate(updatedUser);
  }}
/>
```

## Styling

The dialog uses Tailwind CSS classes and inherits from your theme. To customize:

```typescript
// In your component
<UserSettingsDialog
  user={user}
  trigger={
    <Button
      variant="outline"
      className="custom-class"
    >
      Settings
    </Button>
  }
/>
```

## API Integration

The dialog uses the new service layer:

```typescript
import { userService } from '@/services';

// Updates are handled via:
await userService.updateUser(userId, updateData);
```

## Accessibility

- Keyboard navigation support
- ARIA labels on all inputs
- Focus management
- Screen reader friendly

## Error Handling

```typescript
try {
  await userService.updateUser(userId, data);
  toast.success('Cập nhật thành công!');
} catch (error) {
  toast.error('Không thể cập nhật. Vui lòng thử lại.');
  console.error('Update failed:', error);
}
```

## Best Practices

1. **Always provide onUserUpdate** to keep UI in sync
2. **Use custom trigger** for better UX integration
3. **Handle loading state** in parent if needed
4. **Test with different user data** scenarios

## Dependencies

- `@/components/ui/dialog` - Dialog component
- `@/components/ui/tabs` - Tabs component
- `@/components/ui/switch` - Switch component
- `@/components/ui/select` - Select component
- `@/components/ui/input` - Input component
- `@/components/ui/button` - Button component
- `@/components/ui/label` - Label component
- `react-hook-form` - Form handling
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `@/services/user.service` - API calls
- `@/lib/utils` - Utility functions

## Related Components

- `useUser` hook - For fetching user data
- `useAuth` hook - For authentication context
- `userService` - For API calls
