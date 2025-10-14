export interface PermissionItem {
  id: number;
  name: string;
  displayName: string;
  resourceType: string;
  action: string;
  createdAt: string;
  roleCount: number;
  deletable: boolean;
}

export interface PermissionCreateData {
  name: string;
  displayName: string;
  resourceType: string;
  action: string;
}

export interface PermissionUpdateData {
  displayName?: string;
}

export interface PermissionGroup {
  resourceType: string;
  permissions: PermissionItem[];
}
