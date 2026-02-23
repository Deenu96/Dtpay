import { apiClient } from './api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import {
  KYCDetails,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
  KYCStatus,
} from '@/types';

interface KYCStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  pendingToday: number;
}

export const adminKYCService = {
  // Get all KYC submissions
  getKYCSubmissions: async (
    params: PaginationParams & { status?: KYCStatus }
  ): Promise<ApiResponse<PaginatedResponse<KYCDetails>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<KYCDetails>>>(
      ADMIN_ENDPOINTS.KYC.BASE,
      params as Record<string, unknown>
    );
  },

  // Get KYC by ID
  getKYCById: async (id: string): Promise<ApiResponse<KYCDetails>> => {
    return apiClient.get<ApiResponse<KYCDetails>>(ADMIN_ENDPOINTS.KYC.DETAIL(id));
  },

  // Approve KYC
  approveKYC: async (
    id: string,
    notes?: string
  ): Promise<ApiResponse<KYCDetails>> => {
    return apiClient.post<ApiResponse<KYCDetails>>(ADMIN_ENDPOINTS.KYC.APPROVE(id), {
      notes,
    });
  },

  // Reject KYC
  rejectKYC: async (
    id: string,
    reason: string,
    notes?: string
  ): Promise<ApiResponse<KYCDetails>> => {
    return apiClient.post<ApiResponse<KYCDetails>>(ADMIN_ENDPOINTS.KYC.REJECT(id), {
      reason,
      notes,
    });
  },

  // Get KYC statistics
  getKYCStats: async (): Promise<ApiResponse<KYCStats>> => {
    return apiClient.get<ApiResponse<KYCStats>>(ADMIN_ENDPOINTS.KYC.STATS);
  },

  // Bulk approve KYC
  bulkApproveKYC: async (ids: string[]): Promise<ApiResponse<void>> => {
    return apiClient.post<ApiResponse<void>>(`${ADMIN_ENDPOINTS.KYC.BASE}/bulk-approve`, {
      ids,
    });
  },

  // Bulk reject KYC
  bulkRejectKYC: async (
    ids: string[],
    reason: string
  ): Promise<ApiResponse<void>> => {
    return apiClient.post<ApiResponse<void>>(`${ADMIN_ENDPOINTS.KYC.BASE}/bulk-reject`, {
      ids,
      reason,
    });
  },
};
