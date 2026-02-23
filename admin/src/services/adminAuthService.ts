import { apiClient } from './api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import {
  AdminLoginRequest,
  AdminLoginResponse,
  Admin,
  ApiResponse,
} from '@/types';

export const adminAuthService = {
  // Login
  login: async (data: AdminLoginRequest): Promise<ApiResponse<AdminLoginResponse>> => {
    return apiClient.post<ApiResponse<AdminLoginResponse>>(ADMIN_ENDPOINTS.AUTH.LOGIN, data);
  },

  // Logout
  logout: async (): Promise<ApiResponse<void>> => {
    return apiClient.post<ApiResponse<void>>(ADMIN_ENDPOINTS.AUTH.LOGOUT);
  },

  // Get current admin profile
  getProfile: async (): Promise<ApiResponse<Admin>> => {
    return apiClient.get<ApiResponse<Admin>>(ADMIN_ENDPOINTS.AUTH.PROFILE);
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ token: string; refreshToken: string }>> => {
    return apiClient.post<ApiResponse<{ token: string; refreshToken: string }>>(ADMIN_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });
  },

  // Change password
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> => {
    return apiClient.post<ApiResponse<void>>(ADMIN_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    return apiClient.post<ApiResponse<void>>(ADMIN_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  // Reset password
  resetPassword: async (data: {
    token: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> => {
    return apiClient.post<ApiResponse<void>>(ADMIN_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },

  // Store auth data
  setAuthData: (data: AdminLoginResponse) => {
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminRefreshToken', data.refreshToken);
    localStorage.setItem('adminUser', JSON.stringify(data.admin));
  },

  // Clear auth data
  clearAuthData: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
  },

  // Get stored admin
  getStoredAdmin: (): Admin | null => {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  },

  // Check if authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('adminToken');
  },
};
