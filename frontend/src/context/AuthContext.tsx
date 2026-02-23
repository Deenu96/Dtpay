import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { storage } from '@/utils/helpers';
import { STORAGE_KEYS } from '@/utils/constants';
import type { User, LoginCredentials, RegisterData, UpdateProfileData } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    enabled: !!storage.get(STORAGE_KEYS.TOKEN),
    retry: false,
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      storage.set(STORAGE_KEYS.USER, currentUser);
    }
  }, [currentUser]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      storage.set(STORAGE_KEYS.TOKEN, data.token);
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      storage.set(STORAGE_KEYS.USER, data.user);
      setUser(data.user);
      queryClient.setQueryData(['currentUser'], data.user);
      toast.success('Login successful!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      storage.set(STORAGE_KEYS.TOKEN, data.token);
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      storage.set(STORAGE_KEYS.USER, data.user);
      setUser(data.user);
      queryClient.setQueryData(['currentUser'], data.user);
      toast.success('Registration successful!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      storage.remove(STORAGE_KEYS.TOKEN);
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      storage.remove(STORAGE_KEYS.USER);
      setUser(null);
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: () => {
      // Clear storage even if API call fails
      storage.remove(STORAGE_KEYS.TOKEN);
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      storage.remove(STORAGE_KEYS.USER);
      setUser(null);
      queryClient.clear();
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      storage.set(STORAGE_KEYS.USER, updatedUser);
      queryClient.setQueryData(['currentUser'], updatedUser);
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      await loginMutation.mutateAsync(credentials);
    },
    [loginMutation]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      await registerMutation.mutateAsync(data);
    },
    [registerMutation]
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const updateProfile = useCallback(
    async (data: UpdateProfileData) => {
      await updateProfileMutation.mutateAsync(data);
    },
    [updateProfileMutation]
  );

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      storage.set(STORAGE_KEYS.USER, userData);
      queryClient.setQueryData(['currentUser'], userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, [queryClient]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
