import { apiClient } from './api';
import type {
  Wallet,
  WalletBalance,
  Transaction,
  DepositData,
  WithdrawData,
  DepositAddress,
  PaymentRequest,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '@/types';

export const walletService = {
  // Get wallet
  getWallet: async (): Promise<Wallet> => {
    const response = await apiClient.get<ApiResponse<Wallet>>('/wallet');
    return response.data;
  },

  // Get wallet balance
  getBalance: async (): Promise<WalletBalance> => {
    const response = await apiClient.get<ApiResponse<WalletBalance>>('/wallet/balance');
    return response.data;
  },

  // Get transactions
  getTransactions: async (
    params?: PaginationParams & { type?: string; currency?: string; status?: string }
  ): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>(
      '/wallet/transactions',
      { params }
    );
    return response.data;
  },

  // Get transaction by ID
  getTransaction: async (id: string): Promise<Transaction> => {
    const response = await apiClient.get<ApiResponse<Transaction>>(`/wallet/transactions/${id}`);
    return response.data;
  },

  // Deposit
  deposit: async (data: DepositData): Promise<PaymentRequest> => {
    const response = await apiClient.post<ApiResponse<PaymentRequest>>('/deposit-withdraw/deposit', data);
    return response.data;
  },

  // Get deposit address
  getDepositAddress: async (currency: string): Promise<DepositAddress> => {
    const response = await apiClient.get<ApiResponse<DepositAddress>>(
      '/deposit-withdraw/address',
      { params: { currency } }
    );
    return response.data;
  },

  // Withdraw
  withdraw: async (data: WithdrawData): Promise<Transaction> => {
    const response = await apiClient.post<ApiResponse<Transaction>>('/deposit-withdraw/withdraw', data);
    return response.data;
  },

  // Cancel withdrawal
  cancelWithdrawal: async (id: string): Promise<Transaction> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      `/deposit-withdraw/withdraw/${id}/cancel`
    );
    return response.data;
  },

  // Verify deposit
  verifyDeposit: async (id: string, transactionId: string): Promise<Transaction> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      `/deposit-withdraw/deposit/${id}/verify`,
      { transactionId }
    );
    return response.data;
  },

  // Get deposit history
  getDepositHistory: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>(
      '/deposit-withdraw/deposits',
      { params }
    );
    return response.data;
  },

  // Get withdrawal history
  getWithdrawalHistory: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>(
      '/deposit-withdraw/withdrawals',
      { params }
    );
    return response.data;
  },
};
