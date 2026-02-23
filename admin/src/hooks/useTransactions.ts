import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminTransactionService } from '@/services';
import { PaginationParams, TransactionStatus } from '@/types';
import toast from 'react-hot-toast';

const DEPOSITS_QUERY_KEY = 'deposits';
const WITHDRAWALS_QUERY_KEY = 'withdrawals';

// Deposits
export const useDeposits = (
  params: PaginationParams & { status?: TransactionStatus; userId?: string }
) => {
  return useQuery({
    queryKey: [DEPOSITS_QUERY_KEY, params],
    queryFn: () => adminTransactionService.getDeposits(params),
    keepPreviousData: true,
  });
};

export const useDeposit = (id: string) => {
  return useQuery({
    queryKey: [DEPOSITS_QUERY_KEY, id],
    queryFn: () => adminTransactionService.getDepositById(id),
    enabled: !!id,
  });
};

export const useApproveDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      adminTransactionService.approveDeposit(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEPOSITS_QUERY_KEY] });
      toast.success('Deposit approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve deposit');
    },
  });
};

export const useRejectDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminTransactionService.rejectDeposit(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEPOSITS_QUERY_KEY] });
      toast.success('Deposit rejected successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject deposit');
    },
  });
};

export const useDepositStats = () => {
  return useQuery({
    queryKey: [DEPOSITS_QUERY_KEY, 'stats'],
    queryFn: () => adminTransactionService.getDepositStats(),
  });
};

// Withdrawals
export const useWithdrawals = (
  params: PaginationParams & { status?: TransactionStatus; userId?: string }
) => {
  return useQuery({
    queryKey: [WITHDRAWALS_QUERY_KEY, params],
    queryFn: () => adminTransactionService.getWithdrawals(params),
    keepPreviousData: true,
  });
};

export const useWithdrawal = (id: string) => {
  return useQuery({
    queryKey: [WITHDRAWALS_QUERY_KEY, id],
    queryFn: () => adminTransactionService.getWithdrawalById(id),
    enabled: !!id,
  });
};

export const useApproveWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      adminTransactionService.approveWithdrawal(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WITHDRAWALS_QUERY_KEY] });
      toast.success('Withdrawal approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve withdrawal');
    },
  });
};

export const useRejectWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminTransactionService.rejectWithdrawal(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WITHDRAWALS_QUERY_KEY] });
      toast.success('Withdrawal rejected successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject withdrawal');
    },
  });
};

export const useWithdrawalStats = () => {
  return useQuery({
    queryKey: [WITHDRAWALS_QUERY_KEY, 'stats'],
    queryFn: () => adminTransactionService.getWithdrawalStats(),
  });
};
