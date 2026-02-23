import { apiClient } from './api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import {
  PlatformSettings,
  UPIAccount,
  BankAccount,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const adminSettingsService = {
  // Get all settings
  getSettings: async (): Promise<ApiResponse<PlatformSettings>> => {
    return apiClient.get<ApiResponse<PlatformSettings>>(ADMIN_ENDPOINTS.SETTINGS.BASE);
  },

  // Update settings
  updateSettings: async (
    settings: Partial<PlatformSettings>
  ): Promise<ApiResponse<PlatformSettings>> => {
    return apiClient.put<ApiResponse<PlatformSettings>>(ADMIN_ENDPOINTS.SETTINGS.UPDATE, settings);
  },

  // Update general settings
  updateGeneralSettings: async (
    data: Partial<PlatformSettings['general']>
  ): Promise<ApiResponse<PlatformSettings>> => {
    return apiClient.patch<ApiResponse<PlatformSettings>>(
      `${ADMIN_ENDPOINTS.SETTINGS.BASE}/general`,
      data
    );
  },

  // Update trading settings
  updateTradingSettings: async (
    data: Partial<PlatformSettings['trading']>
  ): Promise<ApiResponse<PlatformSettings>> => {
    return apiClient.patch<ApiResponse<PlatformSettings>>(
      `${ADMIN_ENDPOINTS.SETTINGS.BASE}/trading`,
      data
    );
  },

  // Update fee settings
  updateFeeSettings: async (
    data: Partial<PlatformSettings['fees']>
  ): Promise<ApiResponse<PlatformSettings>> => {
    return apiClient.patch<ApiResponse<PlatformSettings>>(
      `${ADMIN_ENDPOINTS.SETTINGS.BASE}/fees`,
      data
    );
  },

  // Update UPI settings
  updateUPISettings: async (
    data: Partial<PlatformSettings['upi']>
  ): Promise<ApiResponse<PlatformSettings>> => {
    return apiClient.patch<ApiResponse<PlatformSettings>>(
      `${ADMIN_ENDPOINTS.SETTINGS.BASE}/upi`,
      data
    );
  },

  // Update notification settings
  updateNotificationSettings: async (
    data: Partial<PlatformSettings['notifications']>
  ): Promise<ApiResponse<PlatformSettings>> => {
    return apiClient.patch<ApiResponse<PlatformSettings>>(
      `${ADMIN_ENDPOINTS.SETTINGS.BASE}/notifications`,
      data
    );
  },

  // Toggle maintenance mode
  toggleMaintenanceMode: async (
    enabled: boolean,
    message?: string
  ): Promise<ApiResponse<PlatformSettings>> => {
    return apiClient.post<ApiResponse<PlatformSettings>>(
      `${ADMIN_ENDPOINTS.SETTINGS.BASE}/maintenance`,
      { enabled, message }
    );
  },
};

// UPI Accounts Service
export const upiAccountService = {
  // Get all UPI accounts
  getUPIAccounts: async (
    params: PaginationParams & { userId?: string; verified?: boolean }
  ): Promise<ApiResponse<PaginatedResponse<UPIAccount>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<UPIAccount>>>(
      ADMIN_ENDPOINTS.UPI.BASE,
      params as Record<string, unknown>
    );
  },

  // Verify UPI account
  verifyUPIAccount: async (id: string): Promise<ApiResponse<UPIAccount>> => {
    return apiClient.post<ApiResponse<UPIAccount>>(ADMIN_ENDPOINTS.UPI.VERIFY(id));
  },

  // Unverify UPI account
  unverifyUPIAccount: async (id: string): Promise<ApiResponse<UPIAccount>> => {
    return apiClient.post<ApiResponse<UPIAccount>>(ADMIN_ENDPOINTS.UPI.UNVERIFY(id));
  },

  // Get UPI statistics
  getUPIStats: async (): Promise<
    ApiResponse<{
      total: number;
      verified: number;
      unverified: number;
      usageCount: number;
    }>
  > => {
    return apiClient.get<ApiResponse<{
      total: number;
      verified: number;
      unverified: number;
      usageCount: number;
    }>>(`${ADMIN_ENDPOINTS.UPI.BASE}/stats`);
  },
};

// Bank Accounts Service
export const bankAccountService = {
  // Get all bank accounts
  getBankAccounts: async (
    params: PaginationParams & { userId?: string; verified?: boolean }
  ): Promise<ApiResponse<PaginatedResponse<BankAccount>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<BankAccount>>>(
      ADMIN_ENDPOINTS.BANKS.BASE,
      params as Record<string, unknown>
    );
  },

  // Verify bank account
  verifyBankAccount: async (id: string): Promise<ApiResponse<BankAccount>> => {
    return apiClient.post<ApiResponse<BankAccount>>(ADMIN_ENDPOINTS.BANKS.VERIFY(id));
  },

  // Unverify bank account
  unverifyBankAccount: async (id: string): Promise<ApiResponse<BankAccount>> => {
    return apiClient.post<ApiResponse<BankAccount>>(ADMIN_ENDPOINTS.BANKS.UNVERIFY(id));
  },

  // Get bank statistics
  getBankStats: async (): Promise<
    ApiResponse<{
      total: number;
      verified: number;
      unverified: number;
      usageCount: number;
    }>
  > => {
    return apiClient.get<ApiResponse<{
      total: number;
      verified: number;
      unverified: number;
      usageCount: number;
    }>>(`${ADMIN_ENDPOINTS.BANKS.BASE}/stats`);
  },
};

// Notification Service
export const notificationService = {
  // Send notification to all users
  sendToAll: async (data: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
  }): Promise<ApiResponse<void>> => {
    return apiClient.post<ApiResponse<void>>(
      `${ADMIN_ENDPOINTS.NOTIFICATIONS.SEND}/all`,
      data
    );
  },

  // Send notification to specific user
  sendToUser: async (
    userId: string,
    data: {
      title: string;
      message: string;
      type: 'info' | 'warning' | 'success' | 'error';
    }
  ): Promise<ApiResponse<void>> => {
    return apiClient.post<ApiResponse<void>>(
      `${ADMIN_ENDPOINTS.NOTIFICATIONS.SEND}/user`,
      { userId, ...data }
    );
  },

  // Get notification history
  getHistory: async (
    params: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<unknown>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<unknown>>>(
      ADMIN_ENDPOINTS.NOTIFICATIONS.HISTORY,
      params as Record<string, unknown>
    );
  },
};
