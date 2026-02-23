import { apiClient } from './api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import {
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
  TransactionStatus,
} from '@/types';

interface Deposit {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: string;
  paymentProof?: string;
  upiId?: string;
  transactionId?: string;
  notes?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
}

interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: string;
  bankAccountId?: string;
  upiId?: string;
  walletAddress?: string;
  rejectionReason?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
}

interface DepositStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalAmount: number;
  todayAmount: number;
}

interface WithdrawalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalAmount: number;
  totalFees: number;
  todayAmount: number;
}

export const adminTransactionService = {
  // Deposits
  getDeposits: async (
    params: PaginationParams & { status?: TransactionStatus; userId?: string }
  ): Promise<ApiResponse<PaginatedResponse<Deposit>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<Deposit>>>(
      ADMIN_ENDPOINTS.DEPOSITS.BASE,
      params as Record<string, unknown>
    );
  },

  getDepositById: async (id: string): Promise<ApiResponse<Deposit>> => {
    return apiClient.get<ApiResponse<Deposit>>(ADMIN_ENDPOINTS.DEPOSITS.DETAIL(id));
  },

  approveDeposit: async (
    id: string,
    notes?: string
  ): Promise<ApiResponse<Deposit>> => {
    return apiClient.post<ApiResponse<Deposit>>(ADMIN_ENDPOINTS.DEPOSITS.APPROVE(id), {
      notes,
    });
  },

  rejectDeposit: async (
    id: string,
    reason: string
  ): Promise<ApiResponse<Deposit>> => {
    return apiClient.post<ApiResponse<Deposit>>(ADMIN_ENDPOINTS.DEPOSITS.REJECT(id), {
      reason,
    });
  },

  getDepositStats: async (): Promise<ApiResponse<DepositStats>> => {
    return apiClient.get<ApiResponse<DepositStats>>(ADMIN_ENDPOINTS.DEPOSITS.STATS);
  },

  // Withdrawals
  getWithdrawals: async (
    params: PaginationParams & { status?: TransactionStatus; userId?: string }
  ): Promise<ApiResponse<PaginatedResponse<Withdrawal>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<Withdrawal>>>(
      ADMIN_ENDPOINTS.WITHDRAWALS.BASE,
      params as Record<string, unknown>
    );
  },

  getWithdrawalById: async (id: string): Promise<ApiResponse<Withdrawal>> => {
    return apiClient.get<ApiResponse<Withdrawal>>(ADMIN_ENDPOINTS.WITHDRAWALS.DETAIL(id));
  },

  approveWithdrawal: async (
    id: string,
    notes?: string
  ): Promise<ApiResponse<Withdrawal>> => {
    return apiClient.post<ApiResponse<Withdrawal>>(ADMIN_ENDPOINTS.WITHDRAWALS.APPROVE(id), {
      notes,
    });
  },

  rejectWithdrawal: async (
    id: string,
    reason: string
  ): Promise<ApiResponse<Withdrawal>> => {
    return apiClient.post<ApiResponse<Withdrawal>>(ADMIN_ENDPOINTS.WITHDRAWALS.REJECT(id), {
      reason,
    });
  },

  getWithdrawalStats: async (): Promise<ApiResponse<WithdrawalStats>> => {
    return apiClient.get<ApiResponse<WithdrawalStats>>(ADMIN_ENDPOINTS.WITHDRAWALS.STATS);
  },

  // Bulk actions
  bulkApproveDeposits: async (ids: string[]): Promise<ApiResponse<void>> => {
    return apiClient.post<ApiResponse<void>>(
      `${ADMIN_ENDPOINTS.DEPOSITS.BASE}/bulk-approve`,
      { ids }
    );
  },

  bulkApproveWithdrawals: async (ids: string[]): Promise<ApiResponse<void>> => {
    return apiClient.post<ApiResponse<void>>(
      `${ADMIN_ENDPOINTS.WITHDRAWALS.BASE}/bulk-approve`,
      { ids }
    );
  },
};
