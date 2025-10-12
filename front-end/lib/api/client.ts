import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { apiConfig } from '@/config';
import { ApiResponse } from '@/types';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: apiConfig.baseUrl,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
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

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401 && error.config && !(error.config as any)._retry) {
          (error.config as any)._retry = true;
          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshToken();
              error.config.headers!.Authorization = `Bearer ${response.access_token}`;
              return this.axiosInstance(error.config);
            }
          } catch (refreshError) {
            this.clearTokens();
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

  // Token management
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

  private async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response: AxiosResponse<ApiResponse<any>> = await this.axiosInstance.post(
      apiConfig.endpoints.auth.refreshToken,
      { refresh_token: refreshToken }
    );

    const authResponse = response.data.data;
    if (authResponse) {
      this.setAccessToken(authResponse.access_token);
      this.setRefreshToken(authResponse.refresh_token);
    }

    return authResponse!;
  }

  // Generic request methods
  async get<T>(url: string, config?: any): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.get(url, config);
    return response.data.data!;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.post(url, data, config);
    return response.data.data!;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.put(url, data, config);
    return response.data.data!;
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.patch(url, data, config);
    return response.data.data!;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.delete(url, config);
    return response.data.data!;
  }

  // Expose axios instance for custom requests
  get instance(): AxiosInstance {
    return this.axiosInstance;
  }

  // Token setters for external use
  setTokens(accessToken: string, refreshToken: string, permissions?: Record<string, string[]>) {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
    if (permissions) {
      this.setUserPermissions(permissions);
    }
  }
}

export const apiClient = new ApiClient();
