import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminTradeService } from '@/services';
import { PaginationParams, TradeStatus } from '@/types';
import toast from 'react-hot-toast';

const TRADES_QUERY_KEY = 'trades';

export const useTrades = (
  params: PaginationParams & { status?: TradeStatus; userId?: string; disputed?: boolean }
) => {
  return useQuery({
    queryKey: [TRADES_QUERY_KEY, params],
    queryFn: () => adminTradeService.getTrades(params),
    keepPreviousData: true,
  });
};

export const useTrade = (id: string) => {
  return useQuery({
    queryKey: [TRADES_QUERY_KEY, id],
    queryFn: () => adminTradeService.getTradeById(id),
    enabled: !!id,
  });
};

export const useResolveDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { resolution: 'release_to_buyer' | 'return_to_seller'; reason: string; notes?: string };
    }) => adminTradeService.resolveDispute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRADES_QUERY_KEY] });
      toast.success('Dispute resolved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resolve dispute');
    },
  });
};

export const useCancelTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminTradeService.cancelTrade(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRADES_QUERY_KEY] });
      toast.success('Trade cancelled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel trade');
    },
  });
};

export const useTradeStats = () => {
  return useQuery({
    queryKey: [TRADES_QUERY_KEY, 'stats'],
    queryFn: () => adminTradeService.getTradeStats(),
  });
};

export const useTradeChat = (tradeId: string) => {
  return useQuery({
    queryKey: [TRADES_QUERY_KEY, tradeId, 'chat'],
    queryFn: () => adminTradeService.getTradeChat(tradeId),
    enabled: !!tradeId,
  });
};
