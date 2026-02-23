import { apiClient } from './api';
import type {
  Order,
  CreateOrderData,
  OrderFilter,
  OrderBook,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '@/types';

export const orderService = {
  // Get all orders
  getOrders: async (
    params?: PaginationParams & OrderFilter
  ): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Order>>>(
      '/orders',
      { params }
    );
    return response.data;
  },

  // Get order by ID
  getOrder: async (id: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },

  // Create order
  createOrder: async (data: CreateOrderData): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', data);
    return response.data;
  },

  // Update order
  updateOrder: async (id: string, data: Partial<CreateOrderData>): Promise<Order> => {
    const response = await apiClient.put<ApiResponse<Order>>(`/orders/${id}`, data);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id: string): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(`/orders/${id}/cancel`);
    return response.data;
  },

  // Get my orders
  getMyOrders: async (
    params?: PaginationParams & { status?: string; type?: string }
  ): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Order>>>(
      '/orders/my',
      { params }
    );
    return response.data;
  },

  // Get active orders
  getActiveOrders: async (
    params?: PaginationParams & OrderFilter
  ): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Order>>>(
      '/orders/active',
      { params }
    );
    return response.data;
  },

  // Get buy orders
  getBuyOrders: async (
    params?: PaginationParams & OrderFilter
  ): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Order>>>(
      '/orders/buy',
      { params }
    );
    return response.data;
  },

  // Get sell orders
  getSellOrders: async (
    params?: PaginationParams & OrderFilter
  ): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Order>>>(
      '/orders/sell',
      { params }
    );
    return response.data;
  },

  // Get order book
  getOrderBook: async (): Promise<OrderBook> => {
    const response = await apiClient.get<ApiResponse<OrderBook>>('/orders/book');
    return response.data;
  },

  // Get current price
  getCurrentPrice: async (): Promise<{ price: number; change24h: number }> => {
    const response = await apiClient.get<ApiResponse<{ price: number; change24h: number }>>(
      '/orders/price'
    );
    return response.data;
  },

  // Get price history
  getPriceHistory: async (
    interval: string = '1h'
  ): Promise<{ time: string; price: number; volume: number }[]> => {
    const response = await apiClient.get<
      ApiResponse<{ time: string; price: number; volume: number }[]>
    >('/orders/price-history', { params: { interval } });
    return response.data;
  },
};
