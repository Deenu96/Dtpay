import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/orderService';
import type { CreateOrderData, OrderFilter } from '@/types';
import toast from 'react-hot-toast';

// Hook for orders
export const useOrders = (params?: { page?: number; limit?: number } & OrderFilter) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderService.getOrders(params),
    keepPreviousData: true,
  });
};

// Hook for order by ID
export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrder(id),
    enabled: !!id,
  });
};

// Hook for my orders
export const useMyOrders = (params?: { page?: number; limit?: number; status?: string; type?: string }) => {
  return useQuery({
    queryKey: ['myOrders', params],
    queryFn: () => orderService.getMyOrders(params),
    keepPreviousData: true,
  });
};

// Hook for active orders
export const useActiveOrders = (params?: { page?: number; limit?: number } & OrderFilter) => {
  return useQuery({
    queryKey: ['activeOrders', params],
    queryFn: () => orderService.getActiveOrders(params),
    keepPreviousData: true,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

// Hook for buy orders
export const useBuyOrders = (params?: { page?: number; limit?: number } & OrderFilter) => {
  return useQuery({
    queryKey: ['buyOrders', params],
    queryFn: () => orderService.getBuyOrders(params),
    keepPreviousData: true,
    refetchInterval: 10000,
  });
};

// Hook for sell orders
export const useSellOrders = (params?: { page?: number; limit?: number } & OrderFilter) => {
  return useQuery({
    queryKey: ['sellOrders', params],
    queryFn: () => orderService.getSellOrders(params),
    keepPreviousData: true,
    refetchInterval: 10000,
  });
};

// Hook for order book
export const useOrderBook = () => {
  return useQuery({
    queryKey: ['orderBook'],
    queryFn: () => orderService.getOrderBook(),
    refetchInterval: 5000, // Refetch every 5 seconds
  });
};

// Hook for current price
export const useCurrentPrice = () => {
  return useQuery({
    queryKey: ['currentPrice'],
    queryFn: () => orderService.getCurrentPrice(),
    refetchInterval: 5000,
  });
};

// Hook for price history
export const usePriceHistory = (interval: string = '1h') => {
  return useQuery({
    queryKey: ['priceHistory', interval],
    queryFn: () => orderService.getPriceHistory(interval),
  });
};

// Hook for create order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['activeOrders'] });
      queryClient.invalidateQueries({ queryKey: ['orderBook'] });
      toast.success('Order created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create order');
    },
  });
};

// Hook for update order
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateOrderData> }) =>
      orderService.updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      toast.success('Order updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order');
    },
  });
};

// Hook for cancel order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderService.cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['activeOrders'] });
      queryClient.invalidateQueries({ queryKey: ['orderBook'] });
      toast.success('Order cancelled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel order');
    },
  });
};
