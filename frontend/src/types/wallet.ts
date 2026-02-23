export interface Wallet {
  id: string;
  userId: string;
  usdtBalance: number;
  inrBalance: number;
  usdtLocked: number;
  inrLocked: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletBalance {
  usdt: {
    available: number;
    locked: number;
    total: number;
  };
  inr: {
    available: number;
    locked: number;
    total: number;
  };
}

export type TransactionType = 'deposit' | 'withdrawal' | 'trade' | 'fee' | 'referral' | 'bonus';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  currency: 'USDT' | 'INR';
  amount: number;
  fee?: number;
  status: TransactionStatus;
  description?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DepositData {
  amount: number;
  currency: 'USDT' | 'INR';
  paymentMethod?: string;
  metadata?: Record<string, unknown>;
}

export interface WithdrawData {
  amount: number;
  currency: 'USDT' | 'INR';
  address?: string;
  bankAccountId?: string;
  upiId?: string;
}

export interface DepositAddress {
  currency: string;
  address: string;
  network: string;
  qrCode: string;
}

export interface PaymentRequest {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'expired';
  expiresAt: string;
  upiId?: string;
  qrCode?: string;
}
