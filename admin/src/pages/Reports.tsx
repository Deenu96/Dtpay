import React, { useState } from 'react';
import { Download, BarChart3, Users, TrendingUp, DollarSign, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { useUserStats, useTradingStats, useRevenueStats, useReferralStats } from '@/hooks/useStats';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState(30);

  const { data: userStats } = useUserStats(dateRange);
  const { data: tradingStats } = useTradingStats(dateRange);
  const { data: revenueStats } = useRevenueStats(dateRange);
  const { data: referralStats } = useReferralStats();

  const handleExport = (type: string) => {
    // Mock export functionality
    alert(`Exporting ${type} report...`);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="text-muted-foreground">View detailed platform analytics and reports</p>
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        {/* Users Report */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => handleExport('users')}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{formatNumber(userStats?.data.totalUsers || 0)}</p>
                  </div>
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">New Today</p>
                    <p className="text-2xl font-bold">{formatNumber(userStats?.data.newUsersToday || 0)}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">New This Week</p>
                    <p className="text-2xl font-bold">{formatNumber(userStats?.data.newUsersThisWeek || 0)}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">New This Month</p>
                    <p className="text-2xl font-bold">{formatNumber(userStats?.data.newUsersThisMonth || 0)}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <LineChart
            title="User Growth"
            data={userStats?.data.userGrowth || []}
            lines={[{ key: 'value', name: 'New Users', color: '#3b82f6' }]}
            xAxisKey="date"
            xAxisFormatter={(value) => formatDate(value, 'MMM dd')}
            yAxisFormatter={(value) => formatNumber(value)}
          />
        </TabsContent>

        {/* Trading Report */}
        <TabsContent value="trading" className="space-y-6">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => handleExport('trading')}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{formatNumber(tradingStats?.data.totalOrders || 0)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">24h Volume</p>
                    <p className="text-2xl font-bold">{formatCurrency(tradingStats?.data.tradingVolume24h || 0, 'USDT', 0)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">7d Volume</p>
                    <p className="text-2xl font-bold">{formatCurrency(tradingStats?.data.tradingVolume7d || 0, 'USDT', 0)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">30d Volume</p>
                    <p className="text-2xl font-bold">{formatCurrency(tradingStats?.data.tradingVolume30d || 0, 'USDT', 0)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <BarChart
            title="Trading Volume"
            data={tradingStats?.data.tradingVolumeData || []}
            bars={[{ key: 'value', name: 'Volume (USDT)', color: '#10b981' }]}
            xAxisKey="date"
            xAxisFormatter={(value) => formatDate(value, 'MMM dd')}
            yAxisFormatter={(value) => formatCurrency(value, 'USDT', 0)}
          />
        </TabsContent>

        {/* Revenue Report */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => handleExport('revenue')}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(revenueStats?.data.totalRevenue || 0, 'USDT')}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(revenueStats?.data.revenueToday || 0, 'USDT')}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Trading Fees</p>
                    <p className="text-2xl font-bold">{formatCurrency(revenueStats?.data.tradingFees || 0, 'USDT')}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Withdrawal Fees</p>
                    <p className="text-2xl font-bold">{formatCurrency(revenueStats?.data.withdrawalFees || 0, 'USDT')}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <LineChart
            title="Revenue Trend"
            data={revenueStats?.data.revenueData || []}
            lines={[{ key: 'value', name: 'Revenue (USDT)', color: '#f59e0b' }]}
            xAxisKey="date"
            xAxisFormatter={(value) => formatDate(value, 'MMM dd')}
            yAxisFormatter={(value) => formatCurrency(value, 'USDT', 0)}
          />
        </TabsContent>

        {/* Referrals Report */}
        <TabsContent value="referrals" className="space-y-6">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => handleExport('referrals')}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Referrals</p>
                    <p className="text-2xl font-bold">{formatNumber(referralStats?.data.totalReferrals || 0)}</p>
                  </div>
                  <Share2 className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Referrers</p>
                    <p className="text-2xl font-bold">{formatNumber(referralStats?.data.activeReferrers || 0)}</p>
                  </div>
                  <Share2 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold">{formatCurrency(referralStats?.data.totalReferralEarnings || 0, 'USDT')}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Earnings</p>
                    <p className="text-2xl font-bold">{formatCurrency(referralStats?.data.referralEarningsToday || 0, 'USDT')}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <PieChart
            title="Level Distribution"
            data={[
              { name: 'Level 1', value: referralStats?.data.levelDistribution.level1 || 0, color: '#3b82f6' },
              { name: 'Level 2', value: referralStats?.data.levelDistribution.level2 || 0, color: '#10b981' },
              { name: 'Level 3', value: referralStats?.data.levelDistribution.level3 || 0, color: '#f59e0b' },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
