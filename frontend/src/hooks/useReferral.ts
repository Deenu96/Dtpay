import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { referralService } from '@/services/referralService';
import toast from 'react-hot-toast';

// Hook for referral stats
export const useReferralStats = () => {
  return useQuery({
    queryKey: ['referralStats'],
    queryFn: () => referralService.getStats(),
  });
};

// Hook for referrals
export const useReferrals = (params?: { page?: number; limit?: number; level?: number }) => {
  return useQuery({
    queryKey: ['referrals', params],
    queryFn: () => referralService.getReferrals(params),
    keepPreviousData: true,
  });
};

// Hook for referral by ID
export const useReferral = (id: string) => {
  return useQuery({
    queryKey: ['referral', id],
    queryFn: () => referralService.getReferral(id),
    enabled: !!id,
  });
};

// Hook for earnings
export const useEarnings = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['earnings', params],
    queryFn: () => referralService.getEarnings(params),
    keepPreviousData: true,
  });
};

// Hook for referral tree
export const useReferralTree = () => {
  return useQuery({
    queryKey: ['referralTree'],
    queryFn: () => referralService.getReferralTree(),
  });
};

// Hook for referral link
export const useReferralLink = () => {
  return useQuery({
    queryKey: ['referralLink'],
    queryFn: () => referralService.getReferralLink(),
  });
};

// Hook for commission structure
export const useCommissionStructure = () => {
  return useQuery({
    queryKey: ['commissionStructure'],
    queryFn: () => referralService.getCommissionStructure(),
  });
};

// Hook for leaderboard
export const useLeaderboard = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['leaderboard', params],
    queryFn: () => referralService.getLeaderboard(params),
    keepPreviousData: true,
  });
};

// Hook for claim earnings
export const useClaimEarnings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: referralService.claimEarnings,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['referralStats'] });
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success(`Successfully claimed ${data.amount} USDT`);
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to claim earnings');
    },
  });
};
