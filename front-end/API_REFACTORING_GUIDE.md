# API Refactoring Guide

## Tóm tắt thay đổi

Frontend đã được refactor toàn bộ để tuân theo các best practices, bao gồm:

1. **Automatic Case Transformation**: Request/Response tự động chuyển đổi giữa camelCase (frontend) và snake_case (backend)
2. **Improved Token Refresh Flow**: Xử lý refresh token đúng chuẩn với queue mechanism
3. **Fixed Login Redirect Logic**: Admin được redirect đến `/admin`, user thường đến `/dashboard`
4. **Consistent Type System**: Tất cả types đều dùng camelCase

## Các file đã thay đổi

### 1. API Client (`lib/api/client.ts`)
**Cải tiến:**
- Added automatic camelCase/snake_case transformation cho request và response
- Improved token refresh flow với request queuing
- Better error handling với proper type transformation

**Request Interceptor:**
```typescript
// Tự động transform request body sang snake_case
if (config.data && !(config.data instanceof FormData)) {
  config.data = toSnakeCaseDeep(config.data);
}
```

**Response Interceptor:**
```typescript
// Tự động transform response data sang camelCase
if (response.data) {
  response.data = toCamelCaseDeep(response.data);
}
```

### 2. Case Transformer (`lib/api/case-transformer.ts`) - NEW
**Chức năng:**
- `toSnakeCase(str)`: Convert string từ camelCase sang snake_case
- `toCamelCase(str)`: Convert string từ snake_case sang camelCase
- `toSnakeCaseDeep(obj)`: Recursively transform object keys sang snake_case
- `toCamelCaseDeep(obj)`: Recursively transform object keys sang camelCase

**Ví dụ:**
```typescript
// Request data (camelCase) -> API (snake_case)
{
  firstName: "John",
  lastName: "Doe",
  emailVerified: true
}
// Automatically becomes:
{
  first_name: "John",
  last_name: "Doe",
  email_verified: true
}

// Response data (snake_case) -> Frontend (camelCase)
{
  user_id: 123,
  created_at: "2025-01-01",
  is_onboarded: true
}
// Automatically becomes:
{
  userId: 123,
  createdAt: "2025-01-01",
  isOnboarded: true
}
```

### 3. Auth Types (`types/auth.ts`)
**Cải tiến:**
- Cleaned up interface definitions
- Added JSDoc comments
- Changed `login()` return type from `Promise<void>` to `Promise<User>`
- Updated field names to camelCase (e.g., `new_password` -> `newPassword`)

**Breaking Changes:**
```typescript
// OLD
interface PasswordResetConfirm {
  token: string;
  new_password: string;  // ❌ snake_case
}

// NEW
interface PasswordResetConfirm {
  token: string;
  newPassword: string;  // ✅ camelCase
}
```

### 4. User Types (`types/user.ts`)
**Cải tiến:**
- Fixed field naming: `user_id` -> `userId`
- Added `UserUpdateData` interface
- Better JSDoc comments

**Breaking Changes:**
```typescript
// OLD
export interface User {
  user_id: number;  // ❌ snake_case
  // ...
}

// NEW
export interface User {
  userId: number;  // ✅ camelCase
  // ...
}
```

### 5. Auth Service (`services/auth.service.ts`)
**Cải tiến:**
- Added comprehensive JSDoc comments
- Fixed field names to camelCase (e.g., `refresh_token` -> `refreshToken`)
- Better error handling

### 6. Auth Provider (`components/features/auth/auth-provider.tsx`)
**Cải tiến:**
- `login()` now returns `Promise<User>` instead of `Promise<void>`
- This allows login page to get user data immediately for redirect logic

### 7. Login Page (`app/auth/login/page.tsx`)
**Fixed Issues:**
- ❌ **OLD**: Tried to read `user` from component state (not updated yet after login)
- ✅ **NEW**: Get user data directly from `login()` return value

**OLD CODE (Broken):**
```typescript
await authLogin(formData.email, formData.password);
// Wait for state update (unreliable)
await new Promise(resolve => setTimeout(resolve, 100));

// user might still be null or outdated here ❌
if (user?.roles && user.roles.includes('ADMIN')) {
  router.push('/admin');
}
```

**NEW CODE (Fixed):**
```typescript
// Get user data directly from login ✅
const loggedInUser = await authLogin(formData.email, formData.password);

// Use helper function for redirect logic
const redirectPath = getLoginRedirectPath(loggedInUser);
router.push(redirectPath);
```

### 8. Redirect Helpers (`lib/auth/redirect.ts`) - NEW
**Chức năng:**
- `getLoginRedirectPath(user)`: Determine redirect path based on user data
- `getRoleDefaultPath(role)`: Get default path for a role

**Logic:**
1. Check onboarding status first -> `/onboarding`
2. Check if user is ADMIN -> `/admin`
3. Default -> `/dashboard`

## Migration Guide

### Updating Existing Code

#### 1. Request/Response Body
**Không cần thay đổi gì!** API client tự động xử lý transformation.

```typescript
// Just use camelCase everywhere in frontend ✅
const response = await apiClient.post('/api/endpoint', {
  firstName: 'John',
  lastName: 'Doe',
  isEmailVerified: true
});

// Response is already in camelCase ✅
console.log(response.userId); // Works!
```

#### 2. Type Definitions
Update all snake_case fields to camelCase:

```typescript
// OLD ❌
interface MyData {
  user_id: number;
  created_at: string;
  is_active: boolean;
}

// NEW ✅
interface MyData {
  userId: number;
  createdAt: string;
  isActive: boolean;
}
```

#### 3. Auth Context Usage
If you're checking user after login:

```typescript
// OLD ❌
await login(email, password);
// Hope user state is updated...
if (user?.roles.includes('ADMIN')) { ... }

// NEW ✅
const userData = await login(email, password);
if (userData.roles.includes('ADMIN')) { ... }
```

## Testing Checklist

- [ ] Login với ADMIN role -> redirect đến `/admin`
- [ ] Login với USER role -> redirect đến `/dashboard`
- [ ] Login với user chưa onboarding -> redirect đến `/onboarding`
- [ ] Verify request body được transform sang snake_case
- [ ] Verify response data được transform sang camelCase
- [ ] Test token refresh flow
- [ ] Test logout flow
- [ ] Test các error messages

## API Conventions

### Frontend (TypeScript)
- ✅ Use camelCase for all fields
- ✅ Use TypeScript interfaces with camelCase
- ✅ Import from `@/types`

### Backend (Java)
- Backend giữ nguyên snake_case convention
- Spring Boot tự động serialize/deserialize

### Communication
- Frontend gửi: camelCase -> API client converts -> snake_case
- Backend trả về: snake_case -> API client converts -> camelCase

## Common Issues

### Issue 1: "Property userId does not exist"
**Cause:** Using old snake_case field name
**Fix:** Update to camelCase: `user_id` -> `userId`

### Issue 2: Login redirect not working
**Cause:** Trying to use `user` from context immediately after login
**Fix:** Use return value from `login()` function

### Issue 3: Admin user redirected to /dashboard instead of /admin
**Cause:** `user.roles` is empty because backend returns `scopes` object, not `roles` array
**Fix:** UserService now extracts roles from `scopes` object keys
```typescript
// scopes from backend: { "ADMIN": [...permissions], "USER": [...] }
// We extract roles: ["ADMIN", "USER"]
if (permissions) {
  user.permissions = permissions;
  if (!user.roles || user.roles.length === 0) {
    user.roles = Object.keys(permissions); // ["ADMIN"]
  }
}
```

### Issue 4: Request body fields not recognized by backend
**Cause:** API client transformation disabled or misconfigured
**Fix:** Check that request is going through apiClient, not raw axios

## Best Practices

1. **Always use apiClient** instead of raw axios
2. **Use camelCase** for all frontend code
3. **Define TypeScript interfaces** for all API requests/responses
4. **Use helper functions** (like `getLoginRedirectPath`) for common logic
5. **Don't directly manipulate localStorage** - use apiClient methods
6. **Add JSDoc comments** for exported functions/interfaces

## Support

If you encounter issues, check:
1. Browser console for errors
2. Network tab for request/response format
3. Ensure all types are using camelCase
4. Verify apiClient is being used (not raw axios)
