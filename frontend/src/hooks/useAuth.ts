import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { storage } from '@/utils/helpers';
import { STORAGE_KEYS } from '@/utils/constants';
import type {
  User,
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
} from '@/types';
import toast from 'react-hot-toast';

// Hook for login
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      storage.set(STORAGE_KEYS.TOKEN, data.token);
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      storage.set(STORAGE_KEYS.USER, data.user);
      queryClient.setQueryData(['currentUser'], data.user);
      toast.success('Login successful!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });
};

// Hook for register
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      storage.set(STORAGE_KEYS.TOKEN, data.token);
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      storage.set(STORAGE_KEYS.USER, data.user);
      queryClient.setQueryData(['currentUser'], data.user);
      toast.success('Registration successful!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });
};

// Hook for logout
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      storage.remove(STORAGE_KEYS.TOKEN);
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      storage.remove(STORAGE_KEYS.USER);
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: () => {
      storage.remove(STORAGE_KEYS.TOKEN);
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      storage.remove(STORAGE_KEYS.USER);
      queryClient.clear();
    },
  });
};

// Hook for current user
export const useCurrentUser = () => {
  return useQuery<User, Error>({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: !!storage.get(STORAGE_KEYS.TOKEN),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for forgot password
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      toast.success('Password reset link sent to your email');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send reset link');
    },
  });
};

// Hook for reset password
export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authService.resetPassword(token, newPassword),
    onSuccess: () => {
      toast.success('Password reset successful');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });
};

// Hook for update profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data);
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
};

// Hook for change password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password');
    },
  });
};

// Hook for upload avatar
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.uploadAvatar,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Avatar uploaded successfully');
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload avatar');
    },
  });
};

// Hook for 2FA
export const use2FA = () => {
  const queryClient = useQueryClient();

  const enable2FA = useMutation({
    mutationFn: authService.enable2FA,
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to enable 2FA');
    },
  });

  const verify2FA = useMutation({
    mutationFn: authService.verify2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('2FA enabled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to verify 2FA');
    },
  });

  const disable2FA = useMutation({
    mutationFn: authService.disable2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('2FA disabled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to disable 2FA');
    },
  });

  return { enable2FA, verify2FA, disable2FA };
};
