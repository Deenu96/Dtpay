import { apiClient } from './api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import {
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from '@/types';

interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  referredId: string;
  referredName: string;
  level: number;
  earnings: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrers: number;
  totalEarnings: number;
  todayEarnings: number;
  level1Count: number;
  level2Count: number;
  level3Count: number;
  level1Earnings: number;
  level2Earnings: number;
  level3Earnings: number;
}

interface ReferralRates {
  enabled: boolean;
  level1Commission: number;
  level2Commission: number;
  level3Commission: number;
  minWithdrawalAmount: number;
  commissionType: 'percentage' | 'fixed';
}

interface ReferralTreeNode {
  userId: string;
  userName: string;
  level: number;
  earnings: number;
  referrals: ReferralTreeNode[];
}

export const adminReferralService = {
  // Get all referrals
  getReferrals: async (
    params: PaginationParams & { userId?: string; level?: number }
  ): Promise<ApiResponse<PaginatedResponse<Referral>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<Referral>>>(
      ADMIN_ENDPOINTS.REFERRALS.BASE,
      params as Record<string, unknown>
    );
  },

  // Get referral statistics
  getReferralStats: async (): Promise<ApiResponse<ReferralStats>> => {
    return apiClient.get<ApiResponse<ReferralStats>>(ADMIN_ENDPOINTS.REFERRALS.STATS);
  },

  // Get referral tree for a user
  getReferralTree: async (userId: string): Promise<ApiResponse<ReferralTreeNode>> => {
    return apiClient.get<ApiResponse<ReferralTreeNode>>(
      `${ADMIN_ENDPOINTS.REFERRALS.TREE}/${userId}`
    );
  },

  // Get referral rates
  getReferralRates: async (): Promise<ApiResponse<ReferralRates>> => {
    return apiClient.get<ApiResponse<ReferralRates>>(ADMIN_ENDPOINTS.REFERRALS.RATES);
  },

  // Update referral rates
  updateReferralRates: async (
    data: ReferralRates
  ): Promise<ApiResponse<ReferralRates>> => {
    return apiClient.put<ApiResponse<ReferralRates>>(ADMIN_ENDPOINTS.REFERRALS.RATES, data);
  },

  // Get user referral earnings
  getUserReferralEarnings: async (
    userId: string,
    params: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<unknown>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<unknown>>>(
      `${ADMIN_ENDPOINTS.REFERRALS.BASE}/earnings/${userId}`,
      params as Record<string, unknown>
    );
  },

  // Get top referrers
  getTopReferrers: async (
    limit: number = 10
  ): Promise<ApiResponse<Array<{ userId: string; userName: string; referralCount: number; totalEarnings: number }>>> => {
    return apiClient.get<ApiResponse<Array<{ userId: string; userName: string; referralCount: number; totalEarnings: number }>>>(
      `${ADMIN_ENDPOINTS.REFERRALS.BASE}/top`,
      { limit }
    );
  },
};
