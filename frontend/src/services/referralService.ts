import { apiClient } from './api';
import type {
  ReferralStats,
  Referral,
  ReferralEarning,
  ReferralTreeNode,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '@/types';

export const referralService = {
  // Get referral stats
  getStats: async (): Promise<ReferralStats> => {
    const response = await apiClient.get<ApiResponse<ReferralStats>>('/referral/stats');
    return response.data;
  },

  // Get referrals
  getReferrals: async (
    params?: PaginationParams & { level?: number }
  ): Promise<PaginatedResponse<Referral>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Referral>>>(
      '/referral',
      { params }
    );
    return response.data;
  },

  // Get referral by ID
  getReferral: async (id: string): Promise<Referral> => {
    const response = await apiClient.get<ApiResponse<Referral>>(`/referral/${id}`);
    return response.data;
  },

  // Get earnings
  getEarnings: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<ReferralEarning>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ReferralEarning>>>(
      '/referral/earnings',
      { params }
    );
    return response.data;
  },

  // Get referral tree
  getReferralTree: async (): Promise<ReferralTreeNode> => {
    const response = await apiClient.get<ApiResponse<ReferralTreeNode>>('/referral/tree');
    return response.data;
  },

  // Get referral link
  getReferralLink: async (): Promise<{ link: string; code: string }> => {
    const response = await apiClient.get<ApiResponse<{ link: string; code: string }>>(
      '/referral/link'
    );
    return response.data;
  },

  // Get commission structure
  getCommissionStructure: async (): Promise<
    { level: number; percentage: number; minTradeAmount: number }[]
  > => {
    const response = await apiClient.get<
      ApiResponse<{ level: number; percentage: number; minTradeAmount: number }[]>
    >('/referral/commission-structure');
    return response.data;
  },

  // Claim earnings
  claimEarnings: async (): Promise<{ amount: number; transactionId: string }> => {
    const response = await apiClient.post<ApiResponse<{ amount: number; transactionId: string }>>(
      '/referral/claim'
    );
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (params?: PaginationParams): Promise<
    { userId: string; name: string; avatar?: string; referrals: number; earnings: number }[]
  > => {
    const response = await apiClient.get<
      ApiResponse<
        { userId: string; name: string; avatar?: string; referrals: number; earnings: number }[]
      >
    >('/referral/leaderboard', { params });
    return response.data;
  },
};
