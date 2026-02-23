import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserService } from '@/services';
import { User, UserFilters, PaginationParams } from '@/types';
import toast from 'react-hot-toast';

const USERS_QUERY_KEY = 'users';

export const useUsers = (filters: UserFilters & PaginationParams) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, filters],
    queryFn: () => adminUserService.getUsers(filters),
    keepPreviousData: true,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, id],
    queryFn: () => adminUserService.getUserById(id),
    enabled: !!id,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      adminUserService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY, variables.id] });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminUserService.banUser(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY, variables.id] });
      toast.success('User banned successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to ban user');
    },
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminUserService.unbanUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY, id] });
      toast.success('User unbanned successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unban user');
    },
  });
};

export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      adminUserService.resetUserPassword(id, newPassword),
    onSuccess: () => {
      toast.success('Password reset successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });
};

export const useUserWallets = (userId: string) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, userId, 'wallets'],
    queryFn: () => adminUserService.getUserWallets(userId),
    enabled: !!userId,
  });
};

export const useUserOrders = (userId: string, params: PaginationParams) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, userId, 'orders', params],
    queryFn: () => adminUserService.getUserOrders(userId, params),
    enabled: !!userId,
  });
};

export const useUserTrades = (userId: string, params: PaginationParams) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, userId, 'trades', params],
    queryFn: () => adminUserService.getUserTrades(userId, params),
    enabled: !!userId,
  });
};

export const useUserActivities = (userId: string, params: PaginationParams) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, userId, 'activities', params],
    queryFn: () => adminUserService.getUserActivities(userId, params),
    enabled: !!userId,
  });
};

export const useUserReferralTree = (userId: string) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, userId, 'referrals'],
    queryFn: () => adminUserService.getUserReferralTree(userId),
    enabled: !!userId,
  });
};
