import { apiClient } from './api';
import type {
  User,
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
  ApiResponse,
} from '@/types';

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    return response.data;
  },

  // Register
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    );
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/auth/logout');
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
    const response = await apiClient.post<ApiResponse<{ token: string; refreshToken: string }>>(
      '/auth/refresh',
      { refreshToken }
    );
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/auth/reset-password', {
      token,
      newPassword,
    });
  },

  // Verify email
  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/auth/verify-email', { token });
  },

  // Resend verification email
  resendVerificationEmail: async (): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/auth/resend-verification');
  },

  // Update profile
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>('/user/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/user/change-password', data);
  },

  // Enable 2FA
  enable2FA: async (): Promise<{ secret: string; qrCode: string }> => {
    const response = await apiClient.post<ApiResponse<{ secret: string; qrCode: string }>>(
      '/user/2fa/enable'
    );
    return response.data;
  },

  // Verify 2FA
  verify2FA: async (code: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/user/2fa/verify', { code });
  },

  // Disable 2FA
  disable2FA: async (code: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/user/2fa/disable', { code });
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ avatar: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<ApiResponse<{ avatar: string }>>(
      '/user/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
