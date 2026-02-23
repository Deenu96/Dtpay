import { apiClient } from './api';
import type { ApiResponse } from '@/types';

export interface UPIAccount {
  id: string;
  userId: string;
  upiId: string;
  appName: string;
  qrCode?: string;
  isPrimary: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  userId: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
  accountType: 'savings' | 'current';
  isPrimary: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const upiService = {
  // Get all UPI accounts
  getUPIAccounts: async (): Promise<UPIAccount[]> => {
    const response = await apiClient.get<ApiResponse<UPIAccount[]>>('/upi');
    return response.data;
  },

  // Get UPI account by ID
  getUPIAccount: async (id: string): Promise<UPIAccount> => {
    const response = await apiClient.get<ApiResponse<UPIAccount>>(`/upi/${id}`);
    return response.data;
  },

  // Add UPI account
  addUPIAccount: async (data: {
    upiId: string;
    appName: string;
    qrCode?: File;
  }): Promise<UPIAccount> => {
    const formData = new FormData();
    formData.append('upiId', data.upiId);
    formData.append('appName', data.appName);
    if (data.qrCode) {
      formData.append('qrCode', data.qrCode);
    }

    const response = await apiClient.post<ApiResponse<UPIAccount>>('/upi', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update UPI account
  updateUPIAccount: async (
    id: string,
    data: { upiId?: string; appName?: string; isPrimary?: boolean }
  ): Promise<UPIAccount> => {
    const response = await apiClient.put<ApiResponse<UPIAccount>>(`/upi/${id}`, data);
    return response.data;
  },

  // Delete UPI account
  deleteUPIAccount: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/upi/${id}`);
  },

  // Set primary UPI
  setPrimaryUPI: async (id: string): Promise<UPIAccount> => {
    const response = await apiClient.post<ApiResponse<UPIAccount>>(`/upi/${id}/primary`);
    return response.data;
  },

  // Verify UPI
  verifyUPI: async (id: string): Promise<UPIAccount> => {
    const response = await apiClient.post<ApiResponse<UPIAccount>>(`/upi/${id}/verify`);
    return response.data;
  },

  // Generate QR code
  generateQRCode: async (upiId: string, amount?: number): Promise<{ qrCode: string }> => {
    const response = await apiClient.post<ApiResponse<{ qrCode: string }>>('/upi/generate-qr', {
      upiId,
      amount,
    });
    return response.data;
  },
};

export const bankService = {
  // Get all bank accounts
  getBankAccounts: async (): Promise<BankAccount[]> => {
    const response = await apiClient.get<ApiResponse<BankAccount[]>>('/bank');
    return response.data;
  },

  // Get bank account by ID
  getBankAccount: async (id: string): Promise<BankAccount> => {
    const response = await apiClient.get<ApiResponse<BankAccount>>(`/bank/${id}`);
    return response.data;
  },

  // Add bank account
  addBankAccount: async (data: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName?: string;
    accountType: 'savings' | 'current';
  }): Promise<BankAccount> => {
    const response = await apiClient.post<ApiResponse<BankAccount>>('/bank', data);
    return response.data;
  },

  // Update bank account
  updateBankAccount: async (
    id: string,
    data: Partial<Omit<BankAccount, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<BankAccount> => {
    const response = await apiClient.put<ApiResponse<BankAccount>>(`/bank/${id}`, data);
    return response.data;
  },

  // Delete bank account
  deleteBankAccount: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/bank/${id}`);
  },

  // Set primary bank account
  setPrimaryBank: async (id: string): Promise<BankAccount> => {
    const response = await apiClient.post<ApiResponse<BankAccount>>(`/bank/${id}/primary`);
    return response.data;
  },

  // Verify bank account
  verifyBankAccount: async (id: string): Promise<BankAccount> => {
    const response = await apiClient.post<ApiResponse<BankAccount>>(`/bank/${id}/verify`);
    return response.data;
  },

  // Validate IFSC code
  validateIFSC: async (ifscCode: string): Promise<{
    valid: boolean;
    bankName?: string;
    branch?: string;
  }> => {
    const response = await apiClient.get<ApiResponse<{
      valid: boolean;
      bankName?: string;
      branch?: string;
    }>>(`/bank/validate-ifsc/${ifscCode}`);
    return response.data;
  },
};
