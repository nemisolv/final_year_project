# Permission System Guide

## Overview

Frontend đã được cập nhật để lưu và xử lý permissions/scopes từ backend khi login.

## Backend Response Structure

Khi login thành công, backend trả về:

```json
{
  "timestamp": "2025-10-15 03:03:18",
  "code": 9999,
  "message": "Operation succeeded",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "1f8c62ce...",
    "scopes": {
      "ADMIN": [
        "course.create",
        "course.delete",
        "course.read",
        "course.update",
        "lesson.create",
        "lesson.delete",
        "lesson.read",
        "lesson.update",
        "profile.read",
        "profile.update",
        "system.config",
        "system.monitor",
        "user.create",
        "user.delete",
        "user.read",
        "user.update"
      ]
    }
  }
}
```

## What Was Updated

### 1. Types (`types/auth.ts`)
```typescript
export interface AuthenticationResponse {
  accessToken: string;       // Changed from access_token
  refreshToken: string;      // Changed from refresh_token
  scopes?: Record<string, string[]>; // Role -> Permissions mapping
}
```

### 2. AuthService (`services/auth.service.ts`)
Lưu scopes khi login:
```typescript
apiClient.setTokens(
  response.accessToken,
  response.refreshToken,
  response.scopes  // Lưu permissions vào localStorage
);
```

### 3. ApiClient (`lib/api/client.ts`)
- `setUserScopes()`: Lưu scopes vào localStorage
- `getUserScopes()`: Lấy scopes từ localStorage
- `clearTokens()`: Xóa tokens và scopes khi logout

### 4. Permission Helpers (`lib/auth/permissions.ts`)
Các helper functions để kiểm tra permissions:
- `hasPermission(permission)`: Kiểm tra 1 permission cụ thể
- `hasAnyPermission(permissions[])`: Kiểm tra có bất kỳ permission nào
- `hasAllPermissions(permissions[])`: Kiểm tra có tất cả permissions
- `hasResourcePermission(resource, action)`: Kiểm tra permission theo resource
- `isAdmin()`: Kiểm tra có phải admin không
- `getAllPermissions()`: Lấy tất cả permissions
- `getPermissionsByResource()`: Lấy permissions grouped theo resource

### 5. usePermissions Hook (`hooks/use-permissions.ts`)
React hook để sử dụng trong components

## Usage Examples

### Example 1: Basic Permission Check
```tsx
import { usePermissions } from '@/hooks';

function CourseManagement() {
  const { hasPermission } = usePermissions();

  return (
    <div>
      {hasPermission('course.create') && (
        <button>Create New Course</button>
      )}

      {hasPermission('course.delete') && (
        <button>Delete Course</button>
      )}
    </div>
  );
}
```

### Example 2: Check Multiple Permissions
```tsx
import { usePermissions } from '@/hooks';

function UserManagement() {
  const { hasAnyPermission, hasAllPermissions } = usePermissions();

  // Show if user has ANY of these permissions
  const canManageUsers = hasAnyPermission([
    'user.create',
    'user.update',
    'user.delete'
  ]);

  // Show only if user has ALL permissions
  const canFullyManageUsers = hasAllPermissions([
    'user.create',
    'user.read',
    'user.update',
    'user.delete'
  ]);

  return (
    <div>
      {canManageUsers && <UserTable />}
      {canFullyManageUsers && <AdminControls />}
    </div>
  );
}
```

### Example 3: Resource-Based Check
```tsx
import { usePermissions } from '@/hooks';

function ResourceActions({ resource }: { resource: string }) {
  const { hasResourcePermission } = usePermissions();

  return (
    <div>
      {hasResourcePermission(resource, 'create') && (
        <button>Create</button>
      )}
      {hasResourcePermission(resource, 'update') && (
        <button>Edit</button>
      )}
      {hasResourcePermission(resource, 'delete') && (
        <button>Delete</button>
      )}
    </div>
  );
}

// Usage
<ResourceActions resource="course" />
<ResourceActions resource="lesson" />
<ResourceActions resource="user" />
```

### Example 4: Admin Check
```tsx
import { usePermissions } from '@/hooks';

function AdminPanel() {
  const { isAdmin } = usePermissions();

  if (!isAdmin()) {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      {/* Admin content */}
    </div>
  );
}
```

### Example 5: Display All Permissions
```tsx
import { usePermissions } from '@/hooks';

function PermissionsList() {
  const { getAllPermissions, getPermissionsByResource } = usePermissions();

  const allPermissions = getAllPermissions();
  const permissionsByResource = getPermissionsByResource();

  return (
    <div>
      <h2>All Permissions</h2>
      <ul>
        {allPermissions.map(perm => (
          <li key={perm}>{perm}</li>
        ))}
      </ul>

      <h2>Permissions by Resource</h2>
      {Object.entries(permissionsByResource).map(([resource, actions]) => (
        <div key={resource}>
          <h3>{resource}</h3>
          <ul>
            {actions.map(action => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### Example 6: Protected Route
```tsx
import { usePermissions } from '@/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function ProtectedPage() {
  const { hasPermission } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!hasPermission('course.read')) {
      router.push('/unauthorized');
    }
  }, [hasPermission, router]);

  if (!hasPermission('course.read')) {
    return null; // or loading spinner
  }

  return (
    <div>
      {/* Protected content */}
    </div>
  );
}
```

### Example 7: Conditional Rendering with Multiple Conditions
```tsx
import { usePermissions } from '@/hooks';
import { useAuth } from '@/hooks';

function ComplexComponent() {
  const { user } = useAuth();
  const { hasPermission, hasAnyPermission, isAdmin } = usePermissions();

  const canEdit = hasPermission('course.update');
  const canManage = hasAnyPermission(['course.create', 'course.delete']);
  const admin = isAdmin();

  return (
    <div>
      {/* Everyone can see this */}
      <CourseList />

      {/* Only users with edit permission */}
      {canEdit && <EditButton />}

      {/* Only users who can manage courses */}
      {canManage && <ManagementTools />}

      {/* Only admins */}
      {admin && <AdminControls />}
    </div>
  );
}
```

## Permission Naming Convention

Backend sử dụng format: `{resource}.{action}`

### Resources:
- `course`: Khóa học
- `lesson`: Bài học
- `user`: Người dùng
- `profile`: Hồ sơ cá nhân
- `system`: Hệ thống

### Actions:
- `create`: Tạo mới
- `read`: Đọc/xem
- `update`: Cập nhật
- `delete`: Xóa
- `config`: Cấu hình
- `monitor`: Giám sát

### Examples:
- `course.create`: Tạo khóa học
- `course.read`: Xem khóa học
- `user.update`: Cập nhật người dùng
- `system.monitor`: Giám sát hệ thống

## Storage

Permissions được lưu trong localStorage với key `userScopes`:

```javascript
localStorage.getItem('userScopes')
// Returns: '{"ADMIN":["course.create","course.delete",...]}'
```

Khi logout, tất cả sẽ bị xóa:
- `accessToken`
- `refreshToken`
- `userScopes`

## API Response Handling

Frontend tự động xử lý response từ backend:

```typescript
// Backend response
{
  data: {
    accessToken: "...",
    refreshToken: "...",
    scopes: {
      "ADMIN": ["course.create", ...]
    }
  }
}

// Automatically stored in localStorage as:
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);
localStorage.setItem('userScopes', JSON.stringify(data.scopes));
```

## Testing

Để test permissions:

1. **Login với admin account**
2. **Check localStorage**:
   ```javascript
   JSON.parse(localStorage.getItem('userScopes'))
   ```
3. **Use in component**:
   ```tsx
   const { getAllPermissions } = usePermissions();
   console.log(getAllPermissions());
   ```

## Notes

- Permissions được cache trong localStorage cho performance
- Permissions được clear khi logout hoặc token expire
- Permissions được check ở client-side cho UX, nhưng backend vẫn phải validate
- Use `hasPermission()` cho các action cụ thể
- Use `hasAnyPermission()` khi user cần ít nhất 1 permission
- Use `hasAllPermissions()` khi user cần tất cả permissions
- Use `isAdmin()` cho admin-only features