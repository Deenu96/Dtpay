import { apiClient } from './api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import {
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
  OrderStatus,
  OrderType,
} from '@/types';

interface Order {
  id: string;
  userId: string;
  userName: string;
  type: OrderType;
  status: OrderStatus;
  cryptoCurrency: string;
  fiatCurrency: string;
  price: number;
  amount: number;
  minAmount: number;
  maxAmount: number;
  totalTrades: number;
  completedTrades: number;
  paymentMethods: string[];
  terms?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

interface OrderStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  totalVolume: number;
  todayVolume: number;
}

export const adminOrderService = {
  // Get all orders
  getOrders: async (
    params: PaginationParams & {
      status?: OrderStatus;
      type?: OrderType;
      userId?: string;
    }
  ): Promise<ApiResponse<PaginatedResponse<Order>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<Order>>>(
      ADMIN_ENDPOINTS.ORDERS.BASE,
      params as Record<string, unknown>
    );
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    return apiClient.get<ApiResponse<Order>>(ADMIN_ENDPOINTS.ORDERS.DETAIL(id));
  },

  // Cancel order
  cancelOrder: async (id: string, reason: string): Promise<ApiResponse<Order>> => {
    return apiClient.post<ApiResponse<Order>>(ADMIN_ENDPOINTS.ORDERS.CANCEL(id), {
      reason,
    });
  },

  // Get order statistics
  getOrderStats: async (): Promise<ApiResponse<OrderStats>> => {
    return apiClient.get<ApiResponse<OrderStats>>(ADMIN_ENDPOINTS.ORDERS.STATS);
  },

  // Get order trades
  getOrderTrades: async (
    orderId: string,
    params: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<unknown>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<unknown>>>(
      `${ADMIN_ENDPOINTS.ORDERS.DETAIL(orderId)}/trades`,
      params as Record<string, unknown>
    );
  },
};
