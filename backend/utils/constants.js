/**
 * Application constants
 */

// User roles
const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};

// KYC status
const KYC_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  NOT_SUBMITTED: 'not_submitted',
};

// Order types
const ORDER_TYPES = {
  BUY: 'buy',
  SELL: 'sell',
};

// Order status
const ORDER_STATUS = {
  ACTIVE: 'active',
  MATCHED: 'matched',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

// Trade status
const TRADE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  DISPUTED: 'disputed',
  CANCELLED: 'cancelled',
};

// Transaction types
const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TRADE: 'trade',
  FEE: 'fee',
  REFERRAL_BONUS: 'referral_bonus',
  ADJUSTMENT: 'adjustment',
  ESCROW: 'escrow',
  ESCROW_RELEASE: 'escrow_release',
};

// Transaction status
const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  PROCESSING: 'processing',
};

// Currency types
const CURRENCIES = {
  USDT: 'USDT',
  INR: 'INR',
};

// Payment methods
const PAYMENT_METHODS = {
  UPI: 'upi',
  BANK_TRANSFER: 'bank_transfer',
  BLOCKCHAIN: 'blockchain',
};

// Deposit/Withdrawal status
const DW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
};

// Notification types
const NOTIFICATION_TYPES = {
  ORDER_MATCHED: 'order_matched',
  TRADE_UPDATE: 'trade_update',
  PAYMENT_RECEIVED: 'payment_received',
  KYC_STATUS: 'kyc_status',
  DEPOSIT_COMPLETE: 'deposit_complete',
  WITHDRAWAL_COMPLETE: 'withdrawal_complete',
  REFERRAL_BONUS: 'referral_bonus',
  SYSTEM: 'system',
};

// Referral levels
const REFERRAL_LEVELS = {
  LEVEL1: 1,
  LEVEL2: 2,
  LEVEL3: 3,
};

// Referral percentages
const REFERRAL_PERCENTAGES = {
  [REFERRAL_LEVELS.LEVEL1]: 0.5, // 0.5%
  [REFERRAL_LEVELS.LEVEL2]: 0.25, // 0.25%
  [REFERRAL_LEVELS.LEVEL3]: 0.1, // 0.1%
};

// Trading limits
const TRADING_LIMITS = {
  MIN_ORDER_AMOUNT_USDT: 10,
  MAX_ORDER_AMOUNT_USDT: 10000,
  TRADING_FEE_PERCENTAGE: 0.1,
  ESCROW_HOLD_HOURS: 24,
};

// UPI status
const UPI_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  VERIFIED: 'verified',
};

// Error codes
const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  TRADE_NOT_FOUND: 'TRADE_NOT_FOUND',
  INVALID_OPERATION: 'INVALID_OPERATION',
  KYC_REQUIRED: 'KYC_REQUIRED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
};

module.exports = {
  USER_ROLES,
  KYC_STATUS,
  ORDER_TYPES,
  ORDER_STATUS,
  TRADE_STATUS,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  CURRENCIES,
  PAYMENT_METHODS,
  DW_STATUS,
  NOTIFICATION_TYPES,
  REFERRAL_LEVELS,
  REFERRAL_PERCENTAGES,
  TRADING_LIMITS,
  UPI_STATUS,
  ERROR_CODES,
};
