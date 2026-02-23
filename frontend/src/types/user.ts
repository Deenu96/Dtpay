export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  kycStatus: KYCStatus;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  updatedAt: string;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
}

export type KYCStatus = 'not_started' | 'pending' | 'verified' | 'rejected';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  referralCode?: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  tradeNotifications: boolean;
  priceAlerts: boolean;
}
