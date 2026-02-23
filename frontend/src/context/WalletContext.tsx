import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '@/services/walletService';
import type {
  Wallet,
  WalletBalance,
  Transaction,
  DepositData,
  WithdrawData,
  PaginatedResponse,
} from '@/types';
import toast from 'react-hot-toast';

interface WalletContextType {
  wallet: Wallet | null;
  balance: WalletBalance | null;
  isLoading: boolean;
  refetchWallet: () => void;
  deposit: (data: DepositData) => Promise<void>;
  withdraw: (data: WithdrawData) => Promise<void>;
  getTransactions: (params?: { page?: number; limit?: number }) => Promise<PaginatedResponse<Transaction>>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // Fetch wallet
  const { data: wallet, isLoading: isWalletLoading, refetch: refetchWallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletService.getWallet(),
  });

  // Fetch balance
  const { data: balance, isLoading: isBalanceLoading } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: () => walletService.getBalance(),
  });

  // Deposit mutation
  const depositMutation = useMutation({
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

  // Withdraw mutation
  const withdrawMutation = useMutation({
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

  const deposit = async (data: DepositData) => {
    await depositMutation.mutateAsync(data);
  };

  const withdraw = async (data: WithdrawData) => {
    await withdrawMutation.mutateAsync(data);
  };

  const getTransactions = async (params?: { page?: number; limit?: number }) => {
    return walletService.getTransactions(params);
  };

  const value: WalletContextType = {
    wallet: wallet || null,
    balance: balance || null,
    isLoading: isWalletLoading || isBalanceLoading,
    refetchWallet,
    deposit,
    withdraw,
    getTransactions,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWalletContext = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};
