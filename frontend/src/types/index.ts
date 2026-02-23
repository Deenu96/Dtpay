// Re-export all types
export * from './user';
export * from './wallet';
export * from './order';
export * from './trade';
export * from './referral';

// Common types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type Theme = 'light' | 'dark' | 'system';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface KYCDocument {
  id: string;
  type: 'pan' | 'aadhaar' | 'selfie';
  status: 'pending' | 'verified' | 'rejected';
  url?: string;
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export type KYCStatus = 'not_started' | 'pending' | 'verified' | 'rejected';

export interface PaymentMethod {
  id: string;
  type: 'upi' | 'bank';
  name: string;
  isPrimary: boolean;
  details: UPIDetails | BankDetails;
}

export interface UPIDetails {
  upiId: string;
  qrCode?: string;
}

export interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName: string;
}
