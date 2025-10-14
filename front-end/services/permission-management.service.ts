import { apiClient } from '@/lib/api/client';
import { apiConfig } from '@/config';
import {
  PermissionItem,
  PermissionCreateData,
  PermissionUpdateData,
  PermissionGroup,
} from '@/types/permission-management';

export class PermissionManagementService {
  async getPermissions(): Promise<PermissionItem[]> {
    return apiClient.get(apiConfig.endpoints.admin.permissions);
  }

  async getPermissionById(id: number): Promise<PermissionItem> {
    return apiClient.get(`${apiConfig.endpoints.admin.permissions}/${id}`);
  }

  async getPermissionsByResource(resourceType: string): Promise<PermissionItem[]> {
    return apiClient.get(`${apiConfig.endpoints.admin.permissions}/by-resource/${resourceType}`);
  }

  async createPermission(data: PermissionCreateData): Promise<PermissionItem> {
    return apiClient.post(apiConfig.endpoints.admin.permissions, data);
  }

  async updatePermission(id: number, data: PermissionUpdateData): Promise<PermissionItem> {
    return apiClient.put(`${apiConfig.endpoints.admin.permissions}/${id}`, data);
  }

  async deletePermission(id: number): Promise<void> {
    return apiClient.delete(`${apiConfig.endpoints.admin.permissions}/${id}`);
  }

  async getPermissionsGrouped(): Promise<PermissionGroup[]> {
    const permissions = await this.getPermissions();
    const grouped = permissions.reduce((acc, perm) => {
      const existing = acc.find(g => g.resourceType === perm.resourceType);
      if (existing) {
        existing.permissions.push(perm);
      } else {
        acc.push({
          resourceType: perm.resourceType,
          permissions: [perm],
        });
      }
      return acc;
    }, [] as PermissionGroup[]);

    return grouped.sort((a, b) => a.resourceType.localeCompare(b.resourceType));
  }
}

export const permissionManagementService = new PermissionManagementService();
