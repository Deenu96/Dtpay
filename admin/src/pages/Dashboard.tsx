import React from 'react';
import {
  Users,
  TrendingUp,
  DollarSign,
  Wallet,
  ShieldCheck,
  ArrowUpCircle,
  ArrowLeftRight,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import StatCard from '@/components/common/StatCard';
import { LineChart, BarChart } from '@/components/charts';
import { useDashboardStats, useUserRegistrationChart, useTradingVolumeChart, useRevenueChart } from '@/hooks/useStats';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';

const Dashboard: React.FC = () => {
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: userChartData } = useUserRegistrationChart(30);
  const { data: volumeChartData } = useTradingVolumeChart(30);
  const { data: revenueChartData } = useRevenueChart(30);

  const stats = statsData?.data;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your platform's performance
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Total Users"
              value={formatNumber(stats?.totalUsers || 0)}
              icon={Users}
              trend={{ value: 12.5, isPositive: true }}
            />
            <StatCard
              title="Active Users (Today)"
              value={formatNumber(stats?.activeUsersToday || 0)}
              icon={Activity}
              trend={{ value: 8.2, isPositive: true }}
            />
            <StatCard
              title="Trading Volume (24h)"
              value={formatCurrency(stats?.totalTradingVolume24h || 0, 'USDT')}
              icon={TrendingUp}
              trend={{ value: 15.3, isPositive: true }}
            />
            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats?.totalRevenue || 0, 'USDT')}
              icon={DollarSign}
              trend={{ value: 5.7, isPositive: true }}
            />
            <StatCard
              title="Pending KYC"
              value={formatNumber(stats?.pendingKYC || 0)}
              icon={ShieldCheck}
              description="Awaiting verification"
              iconClassName="bg-yellow-500/10"
            />
            <StatCard
              title="Pending Withdrawals"
              value={formatNumber(stats?.pendingWithdrawals || 0)}
              icon={ArrowUpCircle}
              description="Requires approval"
              iconClassName="bg-orange-500/10"
            />
            <StatCard
              title="Pending Deposits"
              value={formatNumber(stats?.pendingDeposits || 0)}
              icon={Wallet}
              description="Awaiting confirmation"
              iconClassName="bg-blue-500/10"
            />
            <StatCard
              title="Active Trades"
              value={formatNumber(stats?.activeTrades || 0)}
              icon={ArrowLeftRight}
              description="In progress"
              iconClassName="bg-green-500/10"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          title="User Registrations (Last 30 Days)"
          data={userChartData?.data || []}
          lines={[
            { key: 'value', name: 'New Users', color: '#3b82f6' },
          ]}
          xAxisKey="date"
          xAxisFormatter={(value) => formatDate(value, 'MMM dd')}
          yAxisFormatter={(value) => formatNumber(value)}
        />
        <BarChart
          title="Trading Volume (Last 30 Days)"
          data={volumeChartData?.data || []}
          bars={[
            { key: 'value', name: 'Volume (USDT)', color: '#10b981' },
          ]}
          xAxisKey="date"
          xAxisFormatter={(value) => formatDate(value, 'MMM dd')}
          yAxisFormatter={(value) => formatCurrency(value, 'USDT', 0)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          title="Revenue (Last 30 Days)"
          data={revenueChartData?.data || []}
          lines={[
            { key: 'value', name: 'Revenue (USDT)', color: '#f59e0b' },
          ]}
          xAxisKey="date"
          xAxisFormatter={(value) => formatDate(value, 'MMM dd')}
          yAxisFormatter={(value) => formatCurrency(value, 'USDT', 0)}
        />
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New user registered</p>
                    <p className="text-xs text-muted-foreground">
                      user{i}@example.com - 2 minutes ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
