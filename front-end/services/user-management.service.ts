import { apiClient } from '@/lib/api/client';
import { apiConfig } from '@/config';
import {
  UserListItem,
  UserDetail,
  UserCreateData,
  UserUpdateData,
  AssignRolesData,
} from '@/types/user-management';
import { PagedResponse } from '@/types';

export interface PaginationParams {
  page?: number;  // 1-indexed
  limit?: number; // page size
  sort?: string;
}

export class UserManagementService {
  async getUsers(params: PaginationParams): Promise<PagedResponse<UserListItem>> {
    return apiClient.get(`${apiConfig.endpoints.admin.users}`, { params });
  }

  async searchUsers(keyword: string, params: PaginationParams): Promise<PagedResponse<UserListItem>> {
    return apiClient.get(`${apiConfig.endpoints.admin.users}/search`, {
      params: { ...params, keyword },
    });
  }

  async getUserById(id: number): Promise<UserDetail> {
    return apiClient.get(`${apiConfig.endpoints.admin.users}/${id}`);
  }

  async createUser(data: UserCreateData): Promise<UserDetail> {
    return apiClient.post(apiConfig.endpoints.admin.users, data);
  }

  async updateUser(id: number, data: UserUpdateData): Promise<UserDetail> {
    return apiClient.put(`${apiConfig.endpoints.admin.users}/${id}`, data);
  }

  async deleteUser(id: number): Promise<void> {
    return apiClient.delete(`${apiConfig.endpoints.admin.users}/${id}`);
  }

  async assignRoles(userId: number, data: AssignRolesData): Promise<UserDetail> {
    return apiClient.post(`${apiConfig.endpoints.admin.users}/${userId}/roles`, data);
  }

  async removeRoles(userId: number, roleIds: number[]): Promise<UserDetail> {
    return apiClient.delete(`${apiConfig.endpoints.admin.users}/${userId}/roles`, { data: roleIds });
  }

  async activateUser(id: number): Promise<UserDetail> {
    return apiClient.patch(`${apiConfig.endpoints.admin.users}/${id}/activate`);
  }

  async deactivateUser(id: number): Promise<UserDetail> {
    return apiClient.patch(`${apiConfig.endpoints.admin.users}/${id}/deactivate`);
  }
}

export const userManagementService = new UserManagementService();
