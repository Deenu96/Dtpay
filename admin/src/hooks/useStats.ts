import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services';
import { ADMIN_ENDPOINTS } from '@/utils/constants';
import { DashboardStats, TimeSeriesData } from '@/types';

const STATS_QUERY_KEY = 'stats';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: [STATS_QUERY_KEY, 'dashboard'],
    queryFn: () => apiClient.get<{ data: DashboardStats }>(ADMIN_ENDPOINTS.STATS.DASHBOARD),
  });
};

export const useUserStats = (days: number = 30) => {
  return useQuery({
    queryKey: [STATS_QUERY_KEY, 'users', days],
    queryFn: () =>
      apiClient.get<{
        data: {
          totalUsers: number;
          newUsersToday: number;
          newUsersThisWeek: number;
          newUsersThisMonth: number;
          activeUsers: number;
          bannedUsers: number;
          userGrowth: TimeSeriesData[];
        };
      }>(`${ADMIN_ENDPOINTS.STATS.USERS}?days=${days}`),
  });
};

export const useTradingStats = (days: number = 30) => {
  return useQuery({
    queryKey: [STATS_QUERY_KEY, 'trading', days],
    queryFn: () =>
      apiClient.get<{
        data: {
          totalOrders: number;
          activeOrders: number;
          completedOrders: number;
          cancelledOrders: number;
          totalTradingVolume: number;
          tradingVolume24h: number;
          tradingVolume7d: number;
          tradingVolume30d: number;
          tradingVolumeData: TimeSeriesData[];
        };
      }>(`${ADMIN_ENDPOINTS.STATS.TRADING}?days=${days}`),
  });
};

export const useRevenueStats = (days: number = 30) => {
  return useQuery({
    queryKey: [STATS_QUERY_KEY, 'revenue', days],
    queryFn: () =>
      apiClient.get<{
        data: {
          totalRevenue: number;
          revenueToday: number;
          revenueThisWeek: number;
          revenueThisMonth: number;
          tradingFees: number;
          withdrawalFees: number;
          revenueData: TimeSeriesData[];
        };
      }>(`${ADMIN_ENDPOINTS.STATS.REVENUE}?days=${days}`),
  });
};

export const useReferralStats = () => {
  return useQuery({
    queryKey: [STATS_QUERY_KEY, 'referrals'],
    queryFn: () =>
      apiClient.get<{
        data: {
          totalReferrals: number;
          activeReferrers: number;
          totalReferralEarnings: number;
          referralEarningsToday: number;
          levelDistribution: {
            level1: number;
            level2: number;
            level3: number;
          };
        };
      }>(ADMIN_ENDPOINTS.STATS.REFERRALS),
  });
};

export const useUserRegistrationChart = (days: number = 30) => {
  return useQuery({
    queryKey: [STATS_QUERY_KEY, 'chart', 'registrations', days],
    queryFn: () =>
      apiClient.get<{ data: TimeSeriesData[] }>(
        `${ADMIN_ENDPOINTS.STATS.USERS}/chart?days=${days}`
      ),
  });
};

export const useTradingVolumeChart = (days: number = 30) => {
  return useQuery({
    queryKey: [STATS_QUERY_KEY, 'chart', 'volume', days],
    queryFn: () =>
      apiClient.get<{ data: TimeSeriesData[] }>(
        `${ADMIN_ENDPOINTS.STATS.TRADING}/chart?days=${days}`
      ),
  });
};

export const useRevenueChart = (days: number = 30) => {
  return useQuery({
    queryKey: [STATS_QUERY_KEY, 'chart', 'revenue', days],
    queryFn: () =>
      apiClient.get<{ data: TimeSeriesData[] }>(
        `${ADMIN_ENDPOINTS.STATS.REVENUE}/chart?days=${days}`
      ),
  });
};
