import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Admin, AdminLoginResponse } from '@/types';
import { adminAuthService } from '@/services';
import toast from 'react-hot-toast';

interface AdminAuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedAdmin = adminAuthService.getStoredAdmin();
      if (storedAdmin && adminAuthService.isAuthenticated()) {
        setAdmin(storedAdmin);
        try {
          // Verify token is still valid
          const response = await adminAuthService.getProfile();
          setAdmin(response.data);
        } catch {
          // Token invalid, clear auth
          adminAuthService.clearAuthData();
          setAdmin(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string, twoFactorCode?: string) => {
    try {
      const response = await adminAuthService.login({
        email,
        password,
        twoFactorCode,
      });

      adminAuthService.setAuthData(response.data);
      setAdmin(response.data.admin);
      toast.success('Login successful');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminAuthService.logout();
    } catch {
      // Ignore logout errors
    } finally {
      adminAuthService.clearAuthData();
      setAdmin(null);
      toast.success('Logged out successfully');
    }
  }, []);

  const refreshAdmin = useCallback(async () => {
    try {
      const response = await adminAuthService.getProfile();
      setAdmin(response.data);
      localStorage.setItem('adminUser', JSON.stringify(response.data));
    } catch (error) {
      toast.error('Failed to refresh admin data');
      throw error;
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      await adminAuthService.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password';
      toast.error(message);
      throw error;
    }
  }, []);

  const value: AdminAuthContextType = {
    admin,
    isLoading,
    isAuthenticated: !!admin,
    login,
    logout,
    refreshAdmin,
    changePassword,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
