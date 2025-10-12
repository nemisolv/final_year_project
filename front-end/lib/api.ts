import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API } from './constants';

export interface ApiResponse<T> {
  code?: number;
  message?: string;
  data?: T;
}

export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
  roles?: Record<string, string[]>; // Role -> Permissions mapping
}

export interface User {
  id: number;
  userId: number;
  email: string;
  username: string;
  fullName?: string;
  name?: string;
  roles?: string[] | null;
  permissions?: Record<string, string[]>; // Role -> Permissions mapping
  emailVerified?: boolean;
  status?: string;
  enabled?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  isOnboarded: boolean;
  avatar?: string; // Profile image URL
  // Profile fields
  englishLevel?: string;
  learningGoals?: string;
  preferredAccent?: string;
  dailyStudyGoal?: number;
  notificationEnabled?: boolean;
  privacyLevel?: string;
  dob?: string;
  onboarded?: boolean;
}

export interface UserDashboardStats {
  currentStreakDays: number;
  dailyStudyGoalMinutes: number;
  minutesStudiedToday: number;
  totalXp: number;
  currentLevel: number;
  totalStudyTime: number;
  lessonsCompleted: number;
  exercisesCompleted: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}


export interface Testimonial {
  id: number;
  content: string;
  rating: number;
  authorName: string;
  authorTitle: string;
  authorAvatarUrl?: string;
}

export interface PlatformStats {
  lessonCount: number;
  userCount: number;
  courseCount: number;
  supportHours: string;
}





class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token && token !== 'undefined' && token !== 'null') {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && error.config && !error.config._retry) {
          error.config._retry = true;
          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshToken();
              error.config.headers.Authorization = `Bearer ${response.accessToken}`;
              return this.axiosInstance(error.config);
            }
          } catch (refreshError) {
            this.clearTokens();
            // Redirect to login on refresh token failure
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  private setUserPermissions(permissions: Record<string, string[]>): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userPermissions', JSON.stringify(permissions));
    }
  }

  public getUserPermissions(): Record<string, string[]> | null {
    if (typeof window !== 'undefined') {
      const permissions = localStorage.getItem('userPermissions');
      return permissions ? JSON.parse(permissions) : null;
    }
    return null;
  }

  public clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userPermissions');
    }
  }


   /**
   * Lấy danh sách các testimonials nổi bật cho trang chủ.
   * Đây là một API công khai, không cần xác thực.
   */
  async getFeaturedTestimonials(): Promise<Testimonial[]> {
    try {
      // Sử dụng axiosInstance để gọi đến endpoint đã định nghĩa trong controller
      const response: AxiosResponse<ApiResponse<Testimonial[]>> = await this.axiosInstance.get(
        '/api/v1/testimonials/featured'
      );
      // Trả về mảng dữ liệu bên trong thuộc tính `data` của ApiResponse
      return response.data.data || [];
    } catch (error) {
      console.error("Failed to fetch featured testimonials:", error);
      // Trả về mảng rỗng nếu có lỗi để trang không bị crash
      return [];
    }
  }

    async getPlatformStats(): Promise<PlatformStats> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<PlatformStats>>(
        '/api/v1/platform/stats'
      );
      return response.data.data!;
    } catch (error) {
      console.error("Failed to fetch platform stats:", error);
      // Trả về giá trị mặc định nếu lỗi để trang không bị crash
      return { lessonCount: 500, userCount: 10000, successRate: 95, supportHours: '24/7' };
    }
  }




  // Auth endpoints
  async login(email: string, password: string): Promise<AuthenticationResponse> {
    const response: AxiosResponse<ApiResponse<AuthenticationResponse>> = await this.axiosInstance.post(
      API.endpoints.auth.login,
      { email, password }
    );

    const authResponse = response.data.data;
    if (authResponse) {
      this.setAccessToken(authResponse.accessToken);
      this.setRefreshToken(authResponse.refreshToken);

      // Store roles and permissions if available
      if (authResponse.roles) {
        this.setUserPermissions(authResponse.roles);
      }
    }

    return authResponse!;
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<void> {
    await this.axiosInstance.post<ApiResponse<void>>(
      API.endpoints.auth.signup,
      data
    );
  }

  async logout(): Promise<void> {
    try {
      // Get refresh token before clearing
      const refreshToken = this.getRefreshToken();

      if (refreshToken) {
        // Call backend logout endpoint to invalidate session/token
        await this.axiosInstance.post<ApiResponse<void>>(
          API.endpoints.auth.logout,
          {  refreshToken }
        );
      }
    } catch (error) {
      // Even if the backend call fails, we still clear local tokens
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local tokens
      this.clearTokens();
    }
  }

  async verifyEmail(token: string): Promise<void> {
    await this.axiosInstance.post<ApiResponse<void>>(
      API.endpoints.auth.verifyEmail,
      { token }
    );
  }

  async refreshToken(): Promise<AuthenticationResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response: AxiosResponse<ApiResponse<AuthenticationResponse>> = await this.axiosInstance.post(
      API.endpoints.auth.refreshToken,
      {  refreshToken }
    );

    const authResponse = response.data.data;
    if (authResponse) {
      this.setAccessToken(authResponse.accessToken);
      this.setRefreshToken(authResponse.refreshToken);
    }

    return authResponse!;
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.axiosInstance.post<ApiResponse<void>>(
      API.endpoints.auth.forgotPassword,
      { email }
    );
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    await this.axiosInstance.post<ApiResponse<void>>(
      API.endpoints.auth.resetPassword,
      { token,  newPassword }
    );
  }

  // Admin endpoints
  async getUsers(
    page: number = 0,
    size: number = 10,
    sort?: string
  ): Promise<PaginatedResponse<User>> {
    const params: Record<string, string | number> = { page, size };
    if (sort) {
      params.sort = sort;
    }

    const response: AxiosResponse<ApiResponse<PaginatedResponse<User>>> = await this.axiosInstance.get(
      API.endpoints.admin.users,
      { params }
    );

    return response.data.data!;
  }

  async getUserById(id: number): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.axiosInstance.get(
      `${API.endpoints.admin.users}/${id}`
    );

    return response.data.data!;
  }

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    roles: string[];
  }): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.axiosInstance.post(
      API.endpoints.admin.users,
      data
    );

    return response.data.data!;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.axiosInstance.put(
      `${API.endpoints.admin.users}/${id}`,
      data
    );

    return response.data.data!;
  }

  async deleteUser(id: number): Promise<void> {
    await this.axiosInstance.delete<ApiResponse<void>>(
      `${API.endpoints.admin.users}/${id}`
    );
  }

  async toggleUserStatus(id: number, enabled?: boolean): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.axiosInstance.patch(
      `${API.endpoints.admin.users}/${id}/status`,
      { enabled }
    );

    return response.data.data!;
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await this.axiosInstance.get('/users/me');
      const user = response.data.data!;

      // Attach stored permissions to user object
      const permissions = this.getUserPermissions();
      if (permissions) {
        user.permissions = permissions;
      }

      return user;
    } catch (error: any) {
      // If unauthorized, clear tokens and reject
      if (error.response?.status === 401) {
        this.clearTokens();
      }
      throw error;
    }
  }

  async submitOnboarding(data: {
    dob: string | null;
    dailyStudyGoalInMinutes: number;
    shortIntroduction: string;
    englishLevel: string;
    learningGoals: string;
  }): Promise<void> {
    await this.axiosInstance.post('/users/onboarding', data);
  }

  async getDashboardStats(): Promise<UserDashboardStats> {
    const response: AxiosResponse<ApiResponse<UserDashboardStats>> = await this.axiosInstance.get(
      '/users/me/dashboard-stats'
    );
    return response.data.data!;
  }
}

export const apiClient = new ApiClient();
