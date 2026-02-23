import { apiClient } from './api';
import type {
  User,
  KYCDocument,
  KYCStatus,
  SecuritySettings,
  ApiResponse,
  Notification,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const userService = {
  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/user/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>('/user/profile', data);
    return response.data;
  },

  // Get KYC status
  getKYCStatus: async (): Promise<{ status: KYCStatus; documents: KYCDocument[] }> => {
    const response = await apiClient.get<ApiResponse<{ status: KYCStatus; documents: KYCDocument[] }>>(
      '/user/kyc'
    );
    return response.data;
  },

  // Upload KYC document
  uploadKYCDocument: async (
    type: 'pan' | 'aadhaar' | 'selfie',
    file: File
  ): Promise<KYCDocument> => {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('document', file);

    const response = await apiClient.post<ApiResponse<KYCDocument>>('/user/kyc/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Submit KYC for verification
  submitKYC: async (): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/user/kyc/submit');
  },

  // Get security settings
  getSecuritySettings: async (): Promise<SecuritySettings> => {
    const response = await apiClient.get<ApiResponse<SecuritySettings>>('/user/security');
    return response.data;
  },

  // Update security settings
  updateSecuritySettings: async (settings: Partial<SecuritySettings>): Promise<SecuritySettings> => {
    const response = await apiClient.put<ApiResponse<SecuritySettings>>('/user/security', settings);
    return response.data;
  },

  // Get notifications
  getNotifications: async (
    params?: PaginationParams & { unreadOnly?: boolean }
  ): Promise<PaginatedResponse<Notification>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Notification>>>(
      '/user/notifications',
      { params }
    );
    return response.data;
  },

  // Get unread notification count
  getUnreadNotificationCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get<ApiResponse<{ count: number }>>(
      '/user/notifications/unread-count'
    );
    return response.data;
  },

  // Mark notification as read
  markNotificationAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.post<ApiResponse<Notification>>(
      `/user/notifications/${id}/read`
    );
    return response.data;
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async (): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/user/notifications/read-all');
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/user/notifications/${id}`);
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    tradeUpdates?: boolean;
    priceAlerts?: boolean;
    marketing?: boolean;
  }): Promise<void> => {
    await apiClient.put<ApiResponse<void>>('/user/notification-preferences', preferences);
  },

  // Get activity log
  getActivityLog: async (
    params?: PaginationParams
  ): Promise<
    PaginatedResponse<{
      id: string;
      action: string;
      ip: string;
      userAgent: string;
      createdAt: string;
    }>
  > => {
    const response = await apiClient.get<
      ApiResponse<
        PaginatedResponse<{
          id: string;
          action: string;
          ip: string;
          userAgent: string;
          createdAt: string;
        }>
      >
    >('/user/activity-log', { params });
    return response.data;
  },

  // Enable/Disable 2FA
  toggle2FA: async (enabled: boolean, code?: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/user/2fa/toggle', { enabled, code });
  },

  // Get 2FA QR code
  get2FAQRCode: async (): Promise<{ secret: string; qrCode: string }> => {
    const response = await apiClient.get<ApiResponse<{ secret: string; qrCode: string }>>(
      '/user/2fa/qrcode'
    );
    return response.data;
  },

  // Verify 2FA code
  verify2FACode: async (code: string): Promise<boolean> => {
    const response = await apiClient.post<ApiResponse<{ valid: boolean }>>('/user/2fa/verify', {
      code,
    });
    return response.data.valid;
  },

  // Delete account
  deleteAccount: async (password: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/user/delete-account', { password });
  },
};
