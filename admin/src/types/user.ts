import { Status, KYCStatus } from './index';

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  status: Status;
  kycStatus: KYCStatus;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  referralCode: string;
  referredBy?: string;
  tradingVolume: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  avatar?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface UserWallet {
  id: string;
  userId: string;
  currency: string;
  balance: number;
  frozenBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  createdAt: string;
  updatedAt: string;
}

export interface KYCDocument {
  id: string;
  userId: string;
  type: 'id_card' | 'passport' | 'driving_license' | 'selfie';
  documentNumber?: string;
  frontImage?: string;
  backImage?: string;
  selfieImage?: string;
  status: KYCStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface KYCDetails {
  id: string;
  userId: string;
  user: User;
  documents: KYCDocument[];
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  idType: string;
  idNumber: string;
  address: string;
  status: KYCStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface ReferralNode {
  user: User;
  level: number;
  earnings: number;
  referrals: ReferralNode[];
}

export interface ReferralStats {
  totalReferrals: number;
  level1Count: number;
  level2Count: number;
  level3Count: number;
  totalEarnings: number;
  level1Earnings: number;
  level2Earnings: number;
  level3Earnings: number;
}

export interface UserFilters {
  search?: string;
  status?: Status;
  kycStatus?: KYCStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  details: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}
