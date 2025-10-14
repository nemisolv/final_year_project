import { apiClient } from '@/lib/api/client';
import { apiConfig } from '@/config';
import { User, UserOnboardingData, PaginatedResponse } from '@/types';

export class UserService {
  async getCurrentUser(): Promise<User> {
    const user = await apiClient.get<User>(apiConfig.endpoints.users.me);

    // Attach stored permissions to user object
    const permissions = apiClient.getUserPermissions();
    if (permissions) {
      user.permissions = permissions;

      // Extract roles from permissions object keys if not already present
      // permissions structure: { "ADMIN": [...], "USER": [...] }
      if (!user.roles || user.roles.length === 0) {
        user.roles = Object.keys(permissions);
      }
    }

    return user;
  }

  async submitOnboarding(data: UserOnboardingData): Promise<void> {
    await apiClient.post<void>(apiConfig.endpoints.users.onboarding, data);
  }

  async getUsers(
    page: number = 0,
    size: number = 10,
    sort?: string
  ): Promise<PaginatedResponse<User>> {
    const params: Record<string, string | number> = { page, size };
    if (sort) {
      params.sort = sort;
    }

    return await apiClient.get<PaginatedResponse<User>>(
      apiConfig.endpoints.admin.users,
      { params }
    );
  }

  async getUserById(id: number): Promise<User> {
    return await apiClient.get<User>(`${apiConfig.endpoints.admin.users}/${id}`);
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    return await apiClient.put<User>(`${apiConfig.endpoints.admin.users}/${id}`, data);
  }

  async updateMyProfile(data: Partial<User>): Promise<User> {
    return await apiClient.put<User>(`${apiConfig.endpoints.users.me}`, data);
  }

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete<void>(`${apiConfig.endpoints.admin.users}/${id}`);
  }

  async toggleUserStatus(id: number, enabled?: boolean): Promise<User> {
    return await apiClient.patch<User>(
      `${apiConfig.endpoints.admin.users}/${id}/status`,
      { enabled }
    );
  }
}

export const userService = new UserService();
