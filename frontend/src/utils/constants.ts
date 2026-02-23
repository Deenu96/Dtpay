// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// App Configuration
export const APP_NAME = 'CryptoP2P';
export const APP_DESCRIPTION = 'Secure USDT P2P Trading Platform';

// Trading Constants
export const MIN_ORDER_AMOUNT = 100; // INR
export const MAX_ORDER_AMOUNT = 10000000; // INR
export const MIN_USDT_AMOUNT = 1;
export const MAX_USDT_AMOUNT = 100000;

// Fee Structure
export const TRADING_FEE_PERCENTAGE = 0.5; // 0.5%
export const WITHDRAWAL_FEE_USDT = 1; // 1 USDT
export const WITHDRAWAL_FEE_INR = 10; // 10 INR

// Referral Commission Structure
export const REFERRAL_COMMISSIONS = {
  level1: 50, // 50% of trading fee
  level2: 20, // 20% of trading fee
  level3: 10, // 10% of trading fee
};

// Payment Methods
export const PAYMENT_METHODS = [
  { id: 'upi', name: 'UPI', icon: 'Smartphone' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: 'Building2' },
  { id: 'paytm', name: 'Paytm', icon: 'Wallet' },
  { id: 'phonepe', name: 'PhonePe', icon: 'Smartphone' },
  { id: 'gpay', name: 'Google Pay', icon: 'Smartphone' },
] as const;

// UPI Apps
export const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', color: '#4285F4' },
  { id: 'phonepe', name: 'PhonePe', color: '#5f259f' },
  { id: 'paytm', name: 'Paytm', color: '#00baf2' },
  { id: 'amazon_pay', name: 'Amazon Pay', color: '#00A8E1' },
  { id: 'bhim', name: 'BHIM', color: '#4B286D' },
  { id: 'other', name: 'Other', color: '#6B7280' },
] as const;

// Order Status Colors
export const ORDER_STATUS_COLORS = {
  active: 'bg-green-500',
  filled: 'bg-blue-500',
  cancelled: 'bg-gray-500',
  expired: 'bg-yellow-500',
} as const;

// Trade Status Colors
export const TRADE_STATUS_COLORS = {
  pending: 'bg-yellow-500',
  awaiting_payment: 'bg-orange-500',
  payment_sent: 'bg-blue-500',
  payment_confirmed: 'bg-purple-500',
  completed: 'bg-green-500',
  cancelled: 'bg-gray-500',
  disputed: 'bg-red-500',
} as const;

// KYC Status Colors
export const KYC_STATUS_COLORS = {
  not_started: 'bg-gray-500',
  pending: 'bg-yellow-500',
  verified: 'bg-green-500',
  rejected: 'bg-red-500',
} as const;

// Transaction Status Colors
export const TRANSACTION_STATUS_COLORS = {
  pending: 'bg-yellow-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
  cancelled: 'bg-gray-500',
} as const;

// Trade Timer (in minutes)
export const TRADE_TIMER_MINUTES = 15;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  BUY: '/buy',
  SELL: '/sell',
  ORDERS: '/orders',
  TRADE: '/trade/:id',
  WALLET: '/wallet',
  DEPOSIT: '/deposit',
  WITHDRAW: '/withdraw',
  UPI: '/upi',
  BANK: '/bank',
  REFERRALS: '/referrals',
  KYC: '/kyc',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
} as const;
