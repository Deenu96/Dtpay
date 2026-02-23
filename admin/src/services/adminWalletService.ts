import { apiClient } from './api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import {
  UserWallet,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from '@/types';

interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  userName: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  reference?: string;
  performedBy: string;
  createdAt: string;
}

interface BalanceAdjustRequest {
  userId: string;
  currency: string;
  amount: number;
  type: 'add' | 'deduct';
  reason: string;
}

export const adminWalletService = {
  // Get all wallets
  getWallets: async (
    params: PaginationParams & { search?: string; currency?: string }
  ): Promise<ApiResponse<PaginatedResponse<UserWallet>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<UserWallet>>>(
      ADMIN_ENDPOINTS.WALLETS.BASE,
      params as Record<string, unknown>
    );
  },

  // Get wallet by user ID
  getWalletByUserId: async (
    userId: string,
    currency?: string
  ): Promise<ApiResponse<UserWallet[]>> => {
    return apiClient.get<ApiResponse<UserWallet[]>>(
      `${ADMIN_ENDPOINTS.WALLETS.BASE}/user/${userId}`,
      currency ? { currency } : undefined
    );
  },

  // Adjust balance
  adjustBalance: async (
    data: BalanceAdjustRequest
  ): Promise<ApiResponse<UserWallet>> => {
    return apiClient.post<ApiResponse<UserWallet>>(ADMIN_ENDPOINTS.WALLETS.ADJUST, data);
  },

  // Get wallet transactions
  getTransactions: async (
    params: PaginationParams & {
      userId?: string;
      currency?: string;
      type?: 'credit' | 'debit';
    }
  ): Promise<ApiResponse<PaginatedResponse<WalletTransaction>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<WalletTransaction>>>(
      ADMIN_ENDPOINTS.WALLETS.TRANSACTIONS,
      params as Record<string, unknown>
    );
  },

  // Get wallet statistics
  getWalletStats: async (): Promise<
    ApiResponse<{
      totalWallets: number;
      totalBalance: number;
      totalFrozen: number;
      currencies: Record<string, { balance: number; frozen: number }>;
    }>
  > => {
    return apiClient.get<ApiResponse<{
      totalWallets: number;
      totalBalance: number;
      totalFrozen: number;
      currencies: Record<string, { balance: number; frozen: number }>;
    }>>(`${ADMIN_ENDPOINTS.WALLETS.BASE}/stats`);
  },

  // Freeze wallet
  freezeWallet: async (
    walletId: string,
    reason: string
  ): Promise<ApiResponse<UserWallet>> => {
    return apiClient.post<ApiResponse<UserWallet>>(
      `${ADMIN_ENDPOINTS.WALLETS.BASE}/${walletId}/freeze`,
      { reason }
    );
  },

  // Unfreeze wallet
  unfreezeWallet: async (walletId: string): Promise<ApiResponse<UserWallet>> => {
    return apiClient.post<ApiResponse<UserWallet>>(
      `${ADMIN_ENDPOINTS.WALLETS.BASE}/${walletId}/unfreeze`
    );
  },
};
