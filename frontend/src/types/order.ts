export type OrderType = 'buy' | 'sell';
export type OrderStatus = 'active' | 'filled' | 'cancelled' | 'expired';

export interface Order {
  id: string;
  userId: string;
  type: OrderType;
  price: number;
  amount: number;
  filledAmount: number;
  remainingAmount: number;
  minAmount: number;
  maxAmount: number;
  paymentMethods: string[];
  status: OrderStatus;
  terms?: string;
  autoReply?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    tradesCompleted: number;
    rating: number;
  };
}

export interface CreateOrderData {
  type: OrderType;
  price: number;
  amount: number;
  minAmount: number;
  maxAmount: number;
  paymentMethods: string[];
  terms?: string;
  autoReply?: string;
}

export interface OrderFilter {
  type?: OrderType;
  minPrice?: number;
  maxPrice?: number;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: string;
  status?: OrderStatus;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
  count: number;
}

export interface OrderBook {
  buyOrders: OrderBookEntry[];
  sellOrders: OrderBookEntry[];
}
