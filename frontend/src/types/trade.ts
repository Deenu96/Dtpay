export type TradeStatus = 
  | 'pending' 
  | 'awaiting_payment' 
  | 'payment_sent' 
  | 'payment_confirmed' 
  | 'completed' 
  | 'cancelled' 
  | 'disputed';

export interface Trade {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  total: number;
  status: TradeStatus;
  paymentMethod: string;
  paymentDetails?: PaymentDetails;
  chatEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  completedAt?: string;
  buyer?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    tradesCompleted: number;
    rating: number;
  };
  seller?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    tradesCompleted: number;
    rating: number;
  };
}

export interface PaymentDetails {
  upiId?: string;
  qrCode?: string;
  bankAccount?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
  transactionId?: string;
  paidAt?: string;
  confirmedAt?: string;
}

export interface ChatMessage {
  id: string;
  tradeId: string;
  senderId: string;
  message: string;
  createdAt: string;
  isSystem: boolean;
}

export interface CreateTradeData {
  orderId: string;
  amount: number;
  paymentMethod: string;
}

export interface DisputeData {
  tradeId: string;
  reason: string;
  description: string;
}

export interface TradeFilter {
  status?: TradeStatus;
  type?: 'buy' | 'sell';
  fromDate?: string;
  toDate?: string;
}
