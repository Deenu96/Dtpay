export interface PlatformSettings {
  general: GeneralSettings;
  trading: TradingSettings;
  referral: ReferralSettings;
  fees: FeeSettings;
  upi: UPISettings;
  notifications: NotificationSettings;
  maintenance: MaintenanceSettings;
}

export interface GeneralSettings {
  platformName: string;
  platformLogo: string;
  supportEmail: string;
  supportPhone: string;
  timezone: string;
  defaultCurrency: string;
}

export interface TradingSettings {
  minOrderAmount: number;
  maxOrderAmount: number;
  minTradeAmount: number;
  maxTradeAmount: number;
  orderExpiryHours: number;
  tradeExpiryMinutes: number;
  autoCancelUnpaidOrders: boolean;
  requireVerifiedForTrading: boolean;
}

export interface ReferralSettings {
  enabled: boolean;
  level1Commission: number;
  level2Commission: number;
  level3Commission: number;
  minWithdrawalAmount: number;
  commissionType: 'percentage' | 'fixed';
}

export interface FeeSettings {
  tradingFeePercentage: number;
  withdrawalFeePercentage: number;
  minWithdrawalFee: number;
  maxWithdrawalFee: number;
  depositFee: number;
}

export interface UPISettings {
  enabled: boolean;
  upiId: string;
  qrCodeImage?: string;
  merchantName: string;
  autoApproveDeposits: boolean;
  minDepositAmount: number;
  maxDepositAmount: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notifyOnNewUser: boolean;
  notifyOnLargeTrade: boolean;
  notifyOnDispute: boolean;
  largeTradeThreshold: number;
}

export interface MaintenanceSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowedIps: string[];
}

export interface UPIAccount {
  id: string;
  userId: string;
  userName: string;
  upiId: string;
  accountHolderName: string;
  bankName?: string;
  isVerified: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  userId: string;
  userName: string;
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  ifscCode: string;
  branchName?: string;
  isVerified: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
