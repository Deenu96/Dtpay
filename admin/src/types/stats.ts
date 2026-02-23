export interface UserStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsers: number;
  bannedUsers: number;
  userGrowth: TimeSeriesData[];
}

export interface TradingStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalTradingVolume: number;
  tradingVolume24h: number;
  tradingVolume7d: number;
  tradingVolume30d: number;
  tradingVolumeData: TimeSeriesData[];
}

export interface TransactionStats {
  totalDeposits: number;
  totalWithdrawals: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  depositVolume: number;
  withdrawalVolume: number;
  depositData: TimeSeriesData[];
  withdrawalData: TimeSeriesData[];
}

export interface RevenueStats {
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  tradingFees: number;
  withdrawalFees: number;
  revenueData: TimeSeriesData[];
}

export interface ReferralStatsData {
  totalReferrals: number;
  activeReferrers: number;
  totalReferralEarnings: number;
  referralEarningsToday: number;
  levelDistribution: {
    level1: number;
    level2: number;
    level3: number;
  };
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface PlatformStats {
  users: UserStats;
  trading: TradingStats;
  transactions: TransactionStats;
  revenue: RevenueStats;
  referrals: ReferralStatsData;
}

export interface ReportData {
  type: 'users' | 'trading' | 'revenue' | 'referrals';
  dateRange: {
    from: string;
    to: string;
  };
  data: unknown[];
  summary: Record<string, number>;
}
