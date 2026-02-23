import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminOrderService } from '@/services';
import { PaginationParams, OrderStatus, OrderType } from '@/types';
import toast from 'react-hot-toast';

const ORDERS_QUERY_KEY = 'orders';

export const useOrders = (
  params: PaginationParams & { status?: OrderStatus; type?: OrderType; userId?: string }
) => {
  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, params],
    queryFn: () => adminOrderService.getOrders(params),
    keepPreviousData: true,
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, id],
    queryFn: () => adminOrderService.getOrderById(id),
    enabled: !!id,
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminOrderService.cancelOrder(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
      toast.success('Order cancelled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel order');
    },
  });
};

export const useOrderStats = () => {
  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, 'stats'],
    queryFn: () => adminOrderService.getOrderStats(),
  });
};

export const useOrderTrades = (orderId: string, params: PaginationParams) => {
  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, orderId, 'trades', params],
    queryFn: () => adminOrderService.getOrderTrades(orderId, params),
    enabled: !!orderId,
  });
};
