export interface RoleListItem {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  createdAt: string;
  userCount: number;
  permissionCount: number;
}

export interface RoleDetail {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  createdAt: string;
  permissions: RolePermission[];
  userCount: number;
  permissionCount: number;
}

export interface RolePermission {
  id: number;
  name: string;
  displayName: string;
  resourceType: string;
  action: string;
  createdAt: string;
  roleCount: number;
  deletable: boolean;
}

export interface RoleCreateData {
  name: string;
  displayName: string;
  description?: string;
  permissionIds?: number[];
}

export interface RoleUpdateData {
  name?: string;
  displayName?: string;
  description?: string;
  permissionIds?: number[];
}

export interface AssignPermissionsData {
  permissionIds: number[];
  replace?: boolean;
}
