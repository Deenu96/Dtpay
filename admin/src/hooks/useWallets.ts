import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminWalletService } from '@/services';
import { PaginationParams } from '@/types';
import toast from 'react-hot-toast';

const WALLETS_QUERY_KEY = 'wallets';

export const useWallets = (params: PaginationParams & { search?: string; currency?: string }) => {
  return useQuery({
    queryKey: [WALLETS_QUERY_KEY, params],
    queryFn: () => adminWalletService.getWallets(params),
    keepPreviousData: true,
  });
};

export const useWalletByUserId = (userId: string, currency?: string) => {
  return useQuery({
    queryKey: [WALLETS_QUERY_KEY, 'user', userId, currency],
    queryFn: () => adminWalletService.getWalletByUserId(userId, currency),
    enabled: !!userId,
  });
};

export const useAdjustBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      currency: string;
      amount: number;
      type: 'add' | 'deduct';
      reason: string;
    }) => adminWalletService.adjustBalance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WALLETS_QUERY_KEY] });
      toast.success('Balance adjusted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to adjust balance');
    },
  });
};

export const useWalletTransactions = (
  params: PaginationParams & { userId?: string; currency?: string; type?: 'credit' | 'debit' }
) => {
  return useQuery({
    queryKey: [WALLETS_QUERY_KEY, 'transactions', params],
    queryFn: () => adminWalletService.getTransactions(params),
    keepPreviousData: true,
  });
};

export const useWalletStats = () => {
  return useQuery({
    queryKey: [WALLETS_QUERY_KEY, 'stats'],
    queryFn: () => adminWalletService.getWalletStats(),
  });
};
