// Common types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type Status = 'active' | 'inactive' | 'pending' | 'banned';
export type OrderStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'disputed';
export type TradeStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
export type TransactionStatus = 'pending' | 'approved' | 'rejected';
export type KYCStatus = 'pending' | 'approved' | 'rejected';
export type OrderType = 'buy' | 'sell';

export interface DateRange {
  from?: Date;
  to?: Date;
}
