import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tradeService } from '@/services/tradeService';
import type { CreateTradeData, DisputeData, TradeFilter } from '@/types';
import toast from 'react-hot-toast';

// Hook for trades
export const useTrades = (params?: { page?: number; limit?: number } & TradeFilter) => {
  return useQuery({
    queryKey: ['trades', params],
    queryFn: () => tradeService.getTrades(params),
    keepPreviousData: true,
  });
};

// Hook for trade by ID
export const useTrade = (id: string) => {
  return useQuery({
    queryKey: ['trade', id],
    queryFn: () => tradeService.getTrade(id),
    enabled: !!id,
    refetchInterval: 5000, // Refetch every 5 seconds for active trades
  });
};

// Hook for my trades
export const useMyTrades = (params?: { page?: number; limit?: number } & TradeFilter) => {
  return useQuery({
    queryKey: ['myTrades', params],
    queryFn: () => tradeService.getMyTrades(params),
    keepPreviousData: true,
  });
};

// Hook for active trades
export const useActiveTrades = () => {
  return useQuery({
    queryKey: ['activeTrades'],
    queryFn: () => tradeService.getActiveTrades(),
    refetchInterval: 5000,
  });
};

// Hook for trade stats
export const useTradeStats = () => {
  return useQuery({
    queryKey: ['tradeStats'],
    queryFn: () => tradeService.getTradeStats(),
  });
};

// Hook for chat messages
export const useChatMessages = (tradeId: string) => {
  return useQuery({
    queryKey: ['chatMessages', tradeId],
    queryFn: () => tradeService.getChatMessages(tradeId),
    enabled: !!tradeId,
    refetchInterval: 3000, // Refetch every 3 seconds
  });
};

// Hook for create trade
export const useCreateTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tradeService.createTrade,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['myTrades'] });
      queryClient.invalidateQueries({ queryKey: ['activeTrades'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success('Trade created successfully');
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create trade');
    },
  });
};

// Hook for cancel trade
export const useCancelTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tradeService.cancelTrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['myTrades'] });
      queryClient.invalidateQueries({ queryKey: ['activeTrades'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success('Trade cancelled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel trade');
    },
  });
};

// Hook for confirm payment sent
export const useConfirmPaymentSent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, transactionId }: { id: string; transactionId?: string }) =>
      tradeService.confirmPaymentSent(id, transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['myTrades'] });
      toast.success('Payment marked as sent');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to confirm payment');
    },
  });
};

// Hook for confirm payment received
export const useConfirmPaymentReceived = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tradeService.confirmPaymentReceived,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['myTrades'] });
      toast.success('Payment confirmed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to confirm payment');
    },
  });
};

// Hook for release crypto
export const useReleaseCrypto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tradeService.releaseCrypto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['myTrades'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success('Crypto released successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to release crypto');
    },
  });
};

// Hook for open dispute
export const useOpenDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<DisputeData, 'tradeId'> }) =>
      tradeService.openDispute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['myTrades'] });
      toast.success('Dispute opened successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to open dispute');
    },
  });
};

// Hook for send chat message
export const useSendChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tradeId, message }: { tradeId: string; message: string }) =>
      tradeService.sendChatMessage(tradeId, message),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', variables.tradeId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message');
    },
  });
};
