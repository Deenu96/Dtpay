import { apiClient } from './api';
import type {
  Trade,
  CreateTradeData,
  ChatMessage,
  DisputeData,
  TradeFilter,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '@/types';

export const tradeService = {
  // Get all trades
  getTrades: async (
    params?: PaginationParams & TradeFilter
  ): Promise<PaginatedResponse<Trade>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Trade>>>(
      '/trades',
      { params }
    );
    return response.data;
  },

  // Get trade by ID
  getTrade: async (id: string): Promise<Trade> => {
    const response = await apiClient.get<ApiResponse<Trade>>(`/trades/${id}`);
    return response.data;
  },

  // Create trade
  createTrade: async (data: CreateTradeData): Promise<Trade> => {
    const response = await apiClient.post<ApiResponse<Trade>>('/trades', data);
    return response.data;
  },

  // Cancel trade
  cancelTrade: async (id: string): Promise<Trade> => {
    const response = await apiClient.post<ApiResponse<Trade>>(`/trades/${id}/cancel`);
    return response.data;
  },

  // Confirm payment sent
  confirmPaymentSent: async (id: string, transactionId?: string): Promise<Trade> => {
    const response = await apiClient.post<ApiResponse<Trade>>(
      `/trades/${id}/payment-sent`,
      { transactionId }
    );
    return response.data;
  },

  // Confirm payment received
  confirmPaymentReceived: async (id: string): Promise<Trade> => {
    const response = await apiClient.post<ApiResponse<Trade>>(
      `/trades/${id}/payment-received`
    );
    return response.data;
  },

  // Release crypto
  releaseCrypto: async (id: string): Promise<Trade> => {
    const response = await apiClient.post<ApiResponse<Trade>>(`/trades/${id}/release`);
    return response.data;
  },

  // Open dispute
  openDispute: async (id: string, data: Omit<DisputeData, 'tradeId'>): Promise<Trade> => {
    const response = await apiClient.post<ApiResponse<Trade>>(
      `/trades/${id}/dispute`,
      data
    );
    return response.data;
  },

  // Get my trades
  getMyTrades: async (
    params?: PaginationParams & TradeFilter
  ): Promise<PaginatedResponse<Trade>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Trade>>>(
      '/trades/my',
      { params }
    );
    return response.data;
  },

  // Get active trades
  getActiveTrades: async (): Promise<Trade[]> => {
    const response = await apiClient.get<ApiResponse<Trade[]>>('/trades/active');
    return response.data;
  },

  // Get trade chat messages
  getChatMessages: async (tradeId: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ApiResponse<ChatMessage[]>>(
      `/trades/${tradeId}/chat`
    );
    return response.data;
  },

  // Send chat message
  sendChatMessage: async (tradeId: string, message: string): Promise<ChatMessage> => {
    const response = await apiClient.post<ApiResponse<ChatMessage>>(
      `/trades/${tradeId}/chat`,
      { message }
    );
    return response.data;
  },

  // Get trade statistics
  getTradeStats: async (): Promise<{
    totalTrades: number;
    completedTrades: number;
    volume30d: number;
    rating: number;
  }> => {
    const response = await apiClient.get<
      ApiResponse<{
        totalTrades: number;
        completedTrades: number;
        volume30d: number;
        rating: number;
      }>
    >('/trades/stats');
    return response.data;
  },
};
