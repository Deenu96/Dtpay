import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '@/services/walletService';
import type { DepositData, WithdrawData, Transaction } from '@/types';
import toast from 'react-hot-toast';

// Hook for wallet
export const useWallet = () => {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletService.getWallet(),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook for wallet balance
export const useWalletBalance = () => {
  return useQuery({
    queryKey: ['walletBalance'],
    queryFn: () => walletService.getBalance(),
    staleTime: 30 * 1000,
  });
};

// Hook for transactions
export const useTransactions = (params?: { page?: number; limit?: number; type?: string; currency?: string }) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => walletService.getTransactions(params),
    keepPreviousData: true,
  });
};

// Hook for deposit
export const useDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: walletService.deposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Deposit initiated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Deposit failed');
    },
  });
};

// Hook for withdraw
export const useWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: walletService.withdraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Withdrawal initiated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Withdrawal failed');
    },
  });
};

// Hook for deposit address
export const useDepositAddress = (currency: string) => {
  return useQuery({
    queryKey: ['depositAddress', currency],
    queryFn: () => walletService.getDepositAddress(currency),
    enabled: !!currency,
  });
};

// Hook for cancel withdrawal
export const useCancelWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: walletService.cancelWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Withdrawal cancelled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel withdrawal');
    },
  });
};

// Hook for verify deposit
export const useVerifyDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, transactionId }: { id: string; transactionId: string }) =>
      walletService.verifyDeposit(id, transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Deposit verified successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to verify deposit');
    },
  });
};
