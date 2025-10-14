import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiConfig } from '@/config';
import { ApiResponse } from '@/types';
import { toCamelCaseDeep, toSnakeCaseDeep } from './case-transformer';

class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

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
    // Request interceptor - Add auth token and transform to snake_case
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add authorization token
        const token = this.getAccessToken();
        if (token && token !== 'undefined' && token !== 'null') {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Transform request body to snake_case (if not FormData)
        if (config.data && !(config.data instanceof FormData)) {
          config.data = toSnakeCaseDeep(config.data);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle 401 and transform to camelCase
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Transform response data to camelCase
        if (response.data) {
          response.data = toCamelCaseDeep(response.data);
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - Token refresh flow
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.axiosInstance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshTokenRequest();

              // Update tokens
              this.setAccessToken(response.accessToken);
              this.setRefreshToken(response.refreshToken);

              // Execute all queued requests with new token
              this.refreshSubscribers.forEach((callback) => callback(response.accessToken));
              this.refreshSubscribers = [];

              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - clear auth and redirect
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Transform error response to camelCase
        if (error.response?.data) {
          error.response.data = toCamelCaseDeep(error.response.data);
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

  private setUserScopes(scopes: Record<string, string[]>): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userScopes', JSON.stringify(scopes));
    }
  }

  public getUserScopes(): Record<string, string[]> | null {
    if (typeof window !== 'undefined') {
      const scopes = localStorage.getItem('userScopes');
      return scopes ? JSON.parse(scopes) : null;
    }
    return null;
  }

  // Backward compatibility - keep old method name
  public getUserPermissions(): Record<string, string[]> | null {
    return this.getUserScopes();
  }

  public clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userScopes');
      localStorage.removeItem('userPermissions'); // Keep for backward compatibility
    }
  }

  private async refreshTokenRequest() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Bypass interceptors for refresh token request to avoid transformation loop
    const response: AxiosResponse<ApiResponse<any>> = await axios.post(
      `${apiConfig.baseUrl}${apiConfig.endpoints.auth.refreshToken}`,
      { refresh_token: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );

    // Manually transform response since we bypassed interceptors
    const transformedData = toCamelCaseDeep(response.data);
    const authResponse = transformedData.data;

    if (!authResponse) {
      throw new Error('Invalid refresh token response');
    }

    return authResponse;
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
  setTokens(accessToken: string, refreshToken: string, scopes?: Record<string, string[]>) {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
    if (scopes) {
      this.setUserScopes(scopes);
    }
  }
}

export const apiClient = new ApiClient();
