// API Endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const ADMIN_ENDPOINTS = {
  AUTH: {
    LOGIN: '/admin/auth/login',
    LOGOUT: '/admin/auth/logout',
    REFRESH: '/admin/auth/refresh',
    PROFILE: '/admin/auth/profile',
    CHANGE_PASSWORD: '/admin/auth/change-password',
    FORGOT_PASSWORD: '/admin/auth/forgot-password',
    RESET_PASSWORD: '/admin/auth/reset-password',
  },
  USERS: {
    BASE: '/admin/users',
    DETAIL: (id: string) => `/admin/users/${id}`,
    BAN: (id: string) => `/admin/users/${id}/ban`,
    UNBAN: (id: string) => `/admin/users/${id}/unban`,
    RESET_PASSWORD: (id: string) => `/admin/users/${id}/reset-password`,
    WALLETS: (id: string) => `/admin/users/${id}/wallets`,
    ORDERS: (id: string) => `/admin/users/${id}/orders`,
    TRADES: (id: string) => `/admin/users/${id}/trades`,
    ACTIVITIES: (id: string) => `/admin/users/${id}/activities`,
  },
  KYC: {
    BASE: '/admin/kyc',
    DETAIL: (id: string) => `/admin/kyc/${id}`,
    APPROVE: (id: string) => `/admin/kyc/${id}/approve`,
    REJECT: (id: string) => `/admin/kyc/${id}/reject`,
    STATS: '/admin/kyc/stats',
  },
  WALLETS: {
    BASE: '/admin/wallets',
    ADJUST: '/admin/wallets/adjust',
    TRANSACTIONS: '/admin/wallets/transactions',
  },
  ORDERS: {
    BASE: '/admin/orders',
    DETAIL: (id: string) => `/admin/orders/${id}`,
    CANCEL: (id: string) => `/admin/orders/${id}/cancel`,
    STATS: '/admin/orders/stats',
  },
  TRADES: {
    BASE: '/admin/trades',
    DETAIL: (id: string) => `/admin/trades/${id}`,
    RESOLVE: (id: string) => `/admin/trades/${id}/resolve`,
    STATS: '/admin/trades/stats',
  },
  DEPOSITS: {
    BASE: '/admin/deposits',
    DETAIL: (id: string) => `/admin/deposits/${id}`,
    APPROVE: (id: string) => `/admin/deposits/${id}/approve`,
    REJECT: (id: string) => `/admin/deposits/${id}/reject`,
    STATS: '/admin/deposits/stats',
  },
  WITHDRAWALS: {
    BASE: '/admin/withdrawals',
    DETAIL: (id: string) => `/admin/withdrawals/${id}`,
    APPROVE: (id: string) => `/admin/withdrawals/${id}/approve`,
    REJECT: (id: string) => `/admin/withdrawals/${id}/reject`,
    STATS: '/admin/withdrawals/stats',
  },
  REFERRALS: {
    BASE: '/admin/referrals',
    STATS: '/admin/referrals/stats',
    TREE: '/admin/referrals/tree',
    RATES: '/admin/referrals/rates',
  },
  UPI: {
    BASE: '/admin/upi',
    VERIFY: (id: string) => `/admin/upi/${id}/verify`,
    UNVERIFY: (id: string) => `/admin/upi/${id}/unverify`,
  },
  BANKS: {
    BASE: '/admin/banks',
    VERIFY: (id: string) => `/admin/banks/${id}/verify`,
    UNVERIFY: (id: string) => `/admin/banks/${id}/unverify`,
  },
  NOTIFICATIONS: {
    BASE: '/admin/notifications',
    SEND: '/admin/notifications/send',
    HISTORY: '/admin/notifications/history',
  },
  SETTINGS: {
    BASE: '/admin/settings',
    UPDATE: '/admin/settings/update',
  },
  STATS: {
    DASHBOARD: '/admin/stats/dashboard',
    USERS: '/admin/stats/users',
    TRADING: '/admin/stats/trading',
    REVENUE: '/admin/stats/revenue',
    REFERRALS: '/admin/stats/referrals',
  },
  LOGS: {
    BASE: '/admin/logs',
    EXPORT: '/admin/logs/export',
  },
  REPORTS: {
    BASE: '/admin/reports',
    EXPORT: '/admin/reports/export',
  },
};

// Status Colors
export const STATUS_COLORS = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  banned: 'bg-red-500/10 text-red-500 border-red-500/20',
  approved: 'bg-green-500/10 text-green-500 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  disputed: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

// Status Labels
export const STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  banned: 'Banned',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
  in_progress: 'In Progress',
};

// Order Type Colors
export const ORDER_TYPE_COLORS = {
  buy: 'bg-green-500/10 text-green-500 border-green-500/20',
  sell: 'bg-red-500/10 text-red-500 border-red-500/20',
};

// Table Pagination Options
export const PAGINATION_OPTIONS = [10, 25, 50, 100];

// Default Pagination
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 25,
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy HH:mm',
  DISPLAY_SHORT: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
};

// Currency Symbols
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  USDT: '₮',
  BTC: '₿',
  ETH: 'Ξ',
};

// Admin Roles
export const ADMIN_ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'support', label: 'Support' },
];

// KYC Document Types
export const KYC_DOCUMENT_TYPES = [
  { value: 'id_card', label: 'ID Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'driving_license', label: 'Driving License' },
];

// Sidebar Menu Items
export const SIDEBAR_MENU = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/users', label: 'Users', icon: 'Users' },
  { path: '/kyc', label: 'KYC Verification', icon: 'ShieldCheck' },
  { path: '/wallets', label: 'Wallets', icon: 'Wallet' },
  { path: '/orders', label: 'Orders', icon: 'ListOrdered' },
  { path: '/trades', label: 'Trades', icon: 'ArrowLeftRight' },
  { path: '/deposits', label: 'Deposits', icon: 'ArrowDownCircle' },
  { path: '/withdrawals', label: 'Withdrawals', icon: 'ArrowUpCircle' },
  { path: '/referrals', label: 'Referrals', icon: 'Share2' },
  { path: '/upi', label: 'UPI Accounts', icon: 'CreditCard' },
  { path: '/banks', label: 'Bank Accounts', icon: 'Landmark' },
  { path: '/notifications', label: 'Notifications', icon: 'Bell' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
  { path: '/audit-logs', label: 'Audit Logs', icon: 'FileText' },
  { path: '/reports', label: 'Reports', icon: 'BarChart3' },
];
