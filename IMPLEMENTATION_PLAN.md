# Implementation Plan: User & Role Management System

## Mục tiêu
Xây dựng hệ thống quản lý User, Role và Permission đầy đủ từ Backend đến Frontend với:
- ✅ Full CRUD cho User, Role, Permission
- ✅ Reusable components cho Frontend
- ✅ UI hoàn toàn bằng tiếng Việt
- ✅ Best practices & Clean Code

---

## Phase 1: Backend Development

### 1.1 DTOs/Payloads (Request/Response)

#### User Management
- `UserCreateRequest` - Tạo user mới
- `UserUpdateRequest` - Cập nhật user
- `UserResponse` - Response cho user
- `UserListResponse` - Paginated list

#### Role Management
- `RoleCreateRequest` - Tạo role mới
- `RoleUpdateRequest` - Cập nhật role
- `RoleResponse` - Response cho role
- `RoleListResponse` - Paginated list
- `AssignPermissionsRequest` - Gán permissions cho role

#### Permission Management
- `PermissionCreateRequest` - Tạo permission mới
- `PermissionUpdateRequest` - Cập nhật permission
- `PermissionResponse` - Response cho permission
- `PermissionListResponse` - List all permissions

### 1.2 Services

#### UserManagementService
```java
// CRUD operations
- createUser(UserCreateRequest) -> UserResponse
- updateUser(Long id, UserUpdateRequest) -> UserResponse
- deleteUser(Long id) -> void
- getUserById(Long id) -> UserResponse
- getAllUsers(Pageable) -> Page<UserResponse>
- searchUsers(String keyword, Pageable) -> Page<UserResponse>

// Role assignment
- assignRoles(Long userId, Set<Long> roleIds) -> UserResponse
- removeRoles(Long userId, Set<Long> roleIds) -> UserResponse

// Status management
- activateUser(Long id) -> UserResponse
- deactivateUser(Long id) -> UserResponse
```

#### RoleManagementService
```java
// CRUD operations
- createRole(RoleCreateRequest) -> RoleResponse
- updateRole(Long id, RoleUpdateRequest) -> RoleResponse
- deleteRole(Long id) -> void
- getRoleById(Long id) -> RoleResponse
- getAllRoles(Pageable) -> Page<RoleResponse>

// Permission management
- assignPermissions(Long roleId, Set<Long> permissionIds) -> RoleResponse
- removePermissions(Long roleId, Set<Long> permissionIds) -> RoleResponse
- getRolePermissions(Long roleId) -> List<PermissionResponse>
```

#### PermissionManagementService
```java
// CRUD operations
- createPermission(PermissionCreateRequest) -> PermissionResponse
- updatePermission(Long id, PermissionUpdateRequest) -> PermissionResponse
- deletePermission(Long id) -> void
- getPermissionById(Long id) -> PermissionResponse
- getAllPermissions() -> List<PermissionResponse>
- getPermissionsByResourceType(String resourceType) -> List<PermissionResponse>
```

### 1.3 REST Controllers

#### UserManagementController
```
GET    /api/admin/users                 - List all users (paginated)
GET    /api/admin/users/{id}            - Get user by ID
POST   /api/admin/users                 - Create new user
PUT    /api/admin/users/{id}            - Update user
DELETE /api/admin/users/{id}            - Delete user
POST   /api/admin/users/{id}/roles      - Assign roles to user
DELETE /api/admin/users/{id}/roles      - Remove roles from user
PATCH  /api/admin/users/{id}/activate   - Activate user
PATCH  /api/admin/users/{id}/deactivate - Deactivate user
```

#### RoleManagementController
```
GET    /api/admin/roles                      - List all roles (paginated)
GET    /api/admin/roles/{id}                 - Get role by ID
POST   /api/admin/roles                      - Create new role
PUT    /api/admin/roles/{id}                 - Update role
DELETE /api/admin/roles/{id}                 - Delete role
GET    /api/admin/roles/{id}/permissions     - Get role permissions
POST   /api/admin/roles/{id}/permissions     - Assign permissions
DELETE /api/admin/roles/{id}/permissions     - Remove permissions
```

#### PermissionManagementController
```
GET    /api/admin/permissions                - List all permissions
GET    /api/admin/permissions/{id}           - Get permission by ID
POST   /api/admin/permissions                - Create new permission
PUT    /api/admin/permissions/{id}           - Update permission
DELETE /api/admin/permissions/{id}           - Delete permission
GET    /api/admin/permissions/by-resource/{type} - Filter by resource type
```

---

## Phase 2: Frontend Development

### 2.1 Reusable Components

#### DataTable Component
```typescript
// components/shared/data-table/data-table.tsx
<DataTable
  columns={columns}
  data={data}
  pagination
  searchable
  sortable
  onRowClick={handleRowClick}
  actions={rowActions}
/>
```

**Features:**
- Pagination (client & server-side)
- Search/Filter
- Sorting
- Row selection
- Custom actions per row
- Loading states
- Empty states

#### Form Components
```typescript
// components/shared/forms/
- FormInput
- FormSelect
- FormMultiSelect
- FormCheckbox
- FormDatePicker
- FormTextArea
```

#### Modal/Dialog Components
```typescript
// components/shared/modal/
- ConfirmDialog - Xác nhận hành động
- FormDialog - Form trong dialog
- DetailDialog - Hiển thị chi tiết
```

#### Other Shared Components
```typescript
// components/shared/
- LoadingSpinner
- EmptyState
- ErrorMessage
- Badge
- StatusBadge
- ActionButtons
```

### 2.2 Frontend Services

#### User Service
```typescript
// services/user-management.service.ts
class UserManagementService {
  // CRUD
  getUsers(params: PaginationParams): Promise<PaginatedResponse<User>>
  getUserById(id: number): Promise<User>
  createUser(data: UserCreateData): Promise<User>
  updateUser(id: number, data: UserUpdateData): Promise<User>
  deleteUser(id: number): Promise<void>

  // Role management
  assignRoles(userId: number, roleIds: number[]): Promise<User>
  removeRoles(userId: number, roleIds: number[]): Promise<User>

  // Status
  activateUser(id: number): Promise<User>
  deactivateUser(id: number): Promise<User>
}
```

#### Role Service
```typescript
// services/role-management.service.ts
class RoleManagementService {
  getRoles(params: PaginationParams): Promise<PaginatedResponse<Role>>
  getRoleById(id: number): Promise<Role>
  createRole(data: RoleCreateData): Promise<Role>
  updateRole(id: number, data: RoleUpdateData): Promise<Role>
  deleteRole(id: number): Promise<void>

  getRolePermissions(roleId: number): Promise<Permission[]>
  assignPermissions(roleId: number, permissionIds: number[]): Promise<Role>
  removePermissions(roleId: number, permissionIds: number[]): Promise<Role>
}
```

#### Permission Service
```typescript
// services/permission-management.service.ts
class PermissionManagementService {
  getPermissions(): Promise<Permission[]>
  getPermissionById(id: number): Promise<Permission>
  createPermission(data: PermissionCreateData): Promise<Permission>
  updatePermission(id: number, data: PermissionUpdateData): Promise<Permission>
  deletePermission(id: number): Promise<void>
  getPermissionsByResource(resourceType: string): Promise<Permission[]>
}
```

### 2.3 Frontend Pages/Views

#### User Management
```
/admin/users                    - Danh sách người dùng
/admin/users/create             - Tạo người dùng mới
/admin/users/[id]               - Chi tiết người dùng
/admin/users/[id]/edit          - Chỉnh sửa người dùng
```

**Features:**
- DataTable với search, filter, sort
- Bulk actions (activate, deactivate, delete)
- Inline editing
- Role assignment modal
- User detail view
- Activity logs

#### Role Management
```
/admin/roles                    - Danh sách vai trò
/admin/roles/create             - Tạo vai trò mới
/admin/roles/[id]               - Chi tiết vai trò
/admin/roles/[id]/edit          - Chỉnh sửa vai trò
```

**Features:**
- DataTable với search, sort
- Permission assignment interface
- Role detail with user count
- Permission tree view
- Bulk permission assignment

#### Permission Management
```
/admin/permissions              - Danh sách quyền
/admin/permissions/create       - Tạo quyền mới
/admin/permissions/[id]/edit    - Chỉnh sửa quyền
```

**Features:**
- Grouped by resource type
- Filter by resource/action
- Search permissions
- Permission usage stats (which roles use it)

---

## Phase 3: Internationalization (i18n)

### 3.1 Vietnamese Labels

#### Common Terms
```typescript
{
  // Actions
  "create": "Tạo mới",
  "edit": "Chỉnh sửa",
  "delete": "Xóa",
  "save": "Lưu",
  "cancel": "Hủy",
  "search": "Tìm kiếm",
  "filter": "Lọc",
  "export": "Xuất dữ liệu",
  "import": "Nhập dữ liệu",

  // Status
  "active": "Hoạt động",
  "inactive": "Không hoạt động",
  "pending": "Đang chờ",

  // User Management
  "users": "Người dùng",
  "user": "Người dùng",
  "username": "Tên đăng nhập",
  "email": "Email",
  "role": "Vai trò",
  "roles": "Vai trò",
  "permissions": "Quyền hạn",
  "status": "Trạng thái",

  // Role Management
  "roleName": "Tên vai trò",
  "roleDescription": "Mô tả vai trò",
  "assignPermissions": "Gán quyền",

  // Permission Management
  "permissionName": "Tên quyền",
  "resourceType": "Loại tài nguyên",
  "action": "Hành động",
}
```

### 3.2 i18n Structure
```
/locales
  /vi
    common.json
    users.json
    roles.json
    permissions.json
    validation.json
    errors.json
```

---

## Timeline & Implementation Order

### Week 1: Backend Foundation
- Day 1-2: DTOs/Payloads
- Day 3-4: Services implementation
- Day 5-7: Controllers & API testing

### Week 2: Frontend Foundation
- Day 1-3: Reusable components (DataTable, Forms, Modals)
- Day 4-5: Frontend services
- Day 6-7: Integration testing

### Week 3: User Management
- Day 1-3: User Management pages
- Day 4-5: Role assignment UI
- Day 6-7: Testing & refinement

### Week 4: Role & Permission Management
- Day 1-3: Role Management pages
- Day 4-5: Permission Management pages
- Day 6-7: Vietnamese i18n implementation

---

## Technical Decisions

### Backend
- **Language**: Java with Spring Boot
- **Database**: Using existing JDBC repositories
- **Validation**: Jakarta Validation annotations
- **Security**: JWT with role-based access control
- **Pagination**: Spring Data Pageable
- **Documentation**: Detailed JavaDoc comments

### Frontend
- **Framework**: Next.js 15 with TypeScript
- **UI Library**: Shadcn/ui components
- **State Management**: React hooks + Context API
- **API Client**: Custom apiClient with auto case transformation
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack Table
- **i18n**: next-intl or custom solution

---

## Code Quality Standards

### Backend
✅ Comprehensive JavaDoc for all public methods
✅ Input validation on all endpoints
✅ Proper error handling with custom exceptions
✅ Transaction management for data integrity
✅ Audit logging for sensitive operations
✅ Unit tests for services

### Frontend
✅ TypeScript strict mode
✅ Reusable components with props documentation
✅ Consistent naming conventions (camelCase)
✅ Error boundaries for error handling
✅ Loading states for all async operations
✅ Responsive design (mobile-friendly)
✅ Accessibility (ARIA labels, keyboard navigation)

---

## Next Steps

1. Review and approve this plan
2. Start with Phase 1: Backend DTOs
3. Progress through each phase systematically
4. Test thoroughly at each step
5. Deploy incrementally

Bạn muốn bắt đầu từ phần nào?
