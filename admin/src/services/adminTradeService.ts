import { apiClient } from './api';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import {
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
  TradeStatus,
} from '@/types';

interface Trade {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  status: TradeStatus;
  cryptoCurrency: string;
  fiatCurrency: string;
  price: number;
  amount: number;
  total: number;
  fee: number;
  paymentMethod: string;
  paymentDetails?: string;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  disputeReason?: string;
  disputedBy?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  expiresAt: string;
}

interface TradeStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  disputed: number;
  totalVolume: number;
  totalFees: number;
}

interface DisputeResolution {
  resolution: 'release_to_buyer' | 'return_to_seller';
  reason: string;
  notes?: string;
}

export const adminTradeService = {
  // Get all trades
  getTrades: async (
    params: PaginationParams & {
      status?: TradeStatus;
      userId?: string;
      disputed?: boolean;
    }
  ): Promise<ApiResponse<PaginatedResponse<Trade>>> => {
    return apiClient.get<ApiResponse<PaginatedResponse<Trade>>>(
      ADMIN_ENDPOINTS.TRADES.BASE,
      params as Record<string, unknown>
    );
  },

  // Get trade by ID
  getTradeById: async (id: string): Promise<ApiResponse<Trade>> => {
    return apiClient.get<ApiResponse<Trade>>(ADMIN_ENDPOINTS.TRADES.DETAIL(id));
  },

  // Resolve dispute
  resolveDispute: async (
    id: string,
    data: DisputeResolution
  ): Promise<ApiResponse<Trade>> => {
    return apiClient.post<ApiResponse<Trade>>(ADMIN_ENDPOINTS.TRADES.RESOLVE(id), data);
  },

  // Get trade statistics
  getTradeStats: async (): Promise<ApiResponse<TradeStats>> => {
    return apiClient.get<ApiResponse<TradeStats>>(ADMIN_ENDPOINTS.TRADES.STATS);
  },

  // Cancel trade
  cancelTrade: async (id: string, reason: string): Promise<ApiResponse<Trade>> => {
    return apiClient.post<ApiResponse<Trade>>(
      `${ADMIN_ENDPOINTS.TRADES.DETAIL(id)}/cancel`,
      { reason }
    );
  },

  // Get trade chat
  getTradeChat: async (tradeId: string): Promise<ApiResponse<unknown[]>> => {
    return apiClient.get<ApiResponse<unknown[]>>(
      `${ADMIN_ENDPOINTS.TRADES.DETAIL(tradeId)}/chat`
    );
  },
};
