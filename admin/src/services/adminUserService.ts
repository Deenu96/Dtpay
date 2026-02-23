import { apiClient } from './api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import {
  User,
  UserWallet,
  KYCDetails,
  ReferralNode,
  UserActivity,
  UserFilters,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from '@/types';

export const adminUserService = {
  // Get all users
  getUsers: async (
    filters: UserFilters & PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<User>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<User>>>(
      ADMIN_ENDPOINTS.USERS.BASE,
      filters as Record<string, unknown>
    );
  },

  // Get user by ID
  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    return apiClient.get<ApiResponse<User>>(ADMIN_ENDPOINTS.USERS.DETAIL(id));
  },

  // Update user
  updateUser: async (
    id: string,
    data: Partial<User>
  ): Promise<ApiResponse<User>> => {
    return apiClient.put<ApiResponse<User>>(ADMIN_ENDPOINTS.USERS.DETAIL(id), data);
  },

  // Ban user
  banUser: async (id: string, reason: string): Promise<ApiResponse<User>> => {
    return apiClient.post<ApiResponse<User>>(ADMIN_ENDPOINTS.USERS.BAN(id), { reason });
  },

  // Unban user
  unbanUser: async (id: string): Promise<ApiResponse<User>> => {
    return apiClient.post<ApiResponse<User>>(ADMIN_ENDPOINTS.USERS.UNBAN(id));
  },

  // Reset user password
  resetUserPassword: async (
    id: string,
    newPassword: string
  ): Promise<ApiResponse<void>> => {
    return apiClient.post<ApiResponse<void>>(ADMIN_ENDPOINTS.USERS.RESET_PASSWORD(id), {
      newPassword,
    });
  },

  // Get user wallets
  getUserWallets: async (id: string): Promise<ApiResponse<UserWallet[]>> => {
    return apiClient.get<ApiResponse<UserWallet[]>>(ADMIN_ENDPOINTS.USERS.WALLETS(id));
  },

  // Get user KYC
  getUserKYC: async (id: string): Promise<ApiResponse<KYCDetails>> => {
    return apiClient.get<ApiResponse<KYCDetails>>(`/admin/users/${id}/kyc`);
  },

  // Get user orders
  getUserOrders: async (
    id: string,
    params: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<unknown>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<unknown>>>(
      ADMIN_ENDPOINTS.USERS.ORDERS(id),
      params as Record<string, unknown>
    );
  },

  // Get user trades
  getUserTrades: async (
    id: string,
    params: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<unknown>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<unknown>>>(
      ADMIN_ENDPOINTS.USERS.TRADES(id),
      params as Record<string, unknown>
    );
  },

  // Get user activities
  getUserActivities: async (
    id: string,
    params: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<UserActivity>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<UserActivity>>>(
      ADMIN_ENDPOINTS.USERS.ACTIVITIES(id),
      params as Record<string, unknown>
    );
  },

  // Get user referral tree
  getUserReferralTree: async (id: string): Promise<ApiResponse<ReferralNode>> => {
    return apiClient.get<ApiResponse<ReferralNode>>(`/admin/users/${id}/referrals`);
  },

  // Export users
  exportUsers: async (filters: UserFilters): Promise<Blob> => {
    const response = await apiClient.get<Blob>(`${ADMIN_ENDPOINTS.USERS.BASE}/export`, filters as Record<string, unknown>);
    return response as unknown as Blob;
  },
};
