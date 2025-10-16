import { apiClient } from '@/lib/api/client';
import { apiConfig } from '@/config';
import {
  RoleListItem,
  RoleDetail,
  RoleCreateData,
  RoleUpdateData,
  AssignPermissionsData,
  RolePermission,
} from '@/types/role-management';
import { PagedResponse } from '@/types';

export interface PaginationParams {
  page?: number;  // 1-indexed
  limit?: number; // page size
  sort?: string;
}

export class RoleManagementService {
  async getRoles(params: PaginationParams): Promise<PagedResponse<RoleListItem>> {
    return apiClient.get(`${apiConfig.endpoints.admin.roles}`, { params });
  }

  async getRoleById(id: number): Promise<RoleDetail> {
    return apiClient.get(`${apiConfig.endpoints.admin.roles}/${id}`);
  }

  async createRole(data: RoleCreateData): Promise<RoleDetail> {
    return apiClient.post(apiConfig.endpoints.admin.roles, data);
  }

  async updateRole(id: number, data: RoleUpdateData): Promise<RoleDetail> {
    return apiClient.put(`${apiConfig.endpoints.admin.roles}/${id}`, data);
  }

  async deleteRole(id: number): Promise<void> {
    return apiClient.delete(`${apiConfig.endpoints.admin.roles}/${id}`);
  }

  async getRolePermissions(roleId: number): Promise<RolePermission[]> {
    return apiClient.get(`${apiConfig.endpoints.admin.roles}/${roleId}/permissions`);
  }

  async assignPermissions(roleId: number, data: AssignPermissionsData): Promise<RoleDetail> {
    return apiClient.post(`${apiConfig.endpoints.admin.roles}/${roleId}/permissions`, data);
  }

  async removePermissions(roleId: number, permissionIds: number[]): Promise<RoleDetail> {
    return apiClient.delete(`${apiConfig.endpoints.admin.roles}/${roleId}/permissions`, { data: permissionIds });
  }
}

export const roleManagementService = new RoleManagementService();
