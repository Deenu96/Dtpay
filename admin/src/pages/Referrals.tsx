import React, { useState } from 'react';
import { Search, Users, TrendingUp, Share2, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Pagination from '@/components/common/Pagination';
import StatCard from '@/components/common/StatCard';
import { adminReferralService } from '@/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { formatCurrency, formatNumber } from '@/utils/formatters';

const Referrals: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: statsData } = useQuery({
    queryKey: ['referralStats'],
    queryFn: () => adminReferralService.getReferralStats(),
  });

  const { data: referralsData, isLoading } = useQuery({
    queryKey: ['referrals', page, limit],
    queryFn: () => adminReferralService.getReferrals({ page, limit }),
  });

  const { data: ratesData } = useQuery({
    queryKey: ['referralRates'],
    queryFn: () => adminReferralService.getReferralRates(),
  });

  const updateRates = useMutation({
    mutationFn: (data: {
      enabled: boolean;
      level1Commission: number;
      level2Commission: number;
      level3Commission: number;
      minWithdrawalAmount: number;
      commissionType: 'percentage' | 'fixed';
    }) => adminReferralService.updateReferralRates(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referralRates'] });
      toast.success('Referral rates updated successfully');
      setSettingsModalOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update rates');
    },
  });

  const stats = statsData?.data;
  const referrals = referralsData?.data.data || [];
  const total = referralsData?.data.total || 0;
  const totalPages = Math.ceil(total / limit);
  const rates = ratesData?.data;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Referrals</h1>
          <p className="text-muted-foreground">Manage referral program and commissions</p>
        </div>
        <Button onClick={() => setSettingsModalOpen(true)}>
          <Award className="w-4 h-4 mr-2" />
          Commission Settings
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Referrals"
          value={formatNumber(stats?.totalReferrals || 0)}
          icon={Users}
        />
        <StatCard
          title="Active Referrers"
          value={formatNumber(stats?.activeReferrers || 0)}
          icon={Share2}
        />
        <StatCard
          title="Total Earnings"
          value={formatCurrency(stats?.totalEarnings || 0, 'USDT')}
          icon={TrendingUp}
        />
        <StatCard
          title="Today's Earnings"
          value={formatCurrency(stats?.todayEarnings || 0, 'USDT')}
          icon={TrendingUp}
        />
      </div>

      {/* Level Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Level Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Level 1</p>
              <p className="text-2xl font-bold">{formatNumber(stats?.level1Count || 0)}</p>
              <p className="text-sm text-muted-foreground">
                Earnings: {formatCurrency(stats?.level1Earnings || 0, 'USDT')}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Level 2</p>
              <p className="text-2xl font-bold">{formatNumber(stats?.level2Count || 0)}</p>
              <p className="text-sm text-muted-foreground">
                Earnings: {formatCurrency(stats?.level2Earnings || 0, 'USDT')}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Level 3</p>
              <p className="text-2xl font-bold">{formatNumber(stats?.level3Count || 0)}</p>
              <p className="text-sm text-muted-foreground">
                Earnings: {formatCurrency(stats?.level3Earnings || 0, 'USDT')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Referrals ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referrer</TableHead>
                      <TableHead>Referred User</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No referrals found
                        </TableCell>
                      </TableRow>
                    ) : (
                      referrals.map((referral: { id: string; referrerName: string; referredName: string; level: number; earnings: number; status: string; createdAt: string }) => (
                        <TableRow key={referral.id}>
                          <TableCell className="font-medium">{referral.referrerName}</TableCell>
                          <TableCell>{referral.referredName}</TableCell>
                          <TableCell>Level {referral.level}</TableCell>
                          <TableCell>{formatCurrency(referral.earnings, 'USDT')}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              referral.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
                            }`}>
                              {referral.status}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(referral.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={total}
                pageSize={limit}
                onPageChange={setPage}
                onPageSizeChange={setLimit}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Settings Modal */}
      <Dialog open={settingsModalOpen} onOpenChange={setSettingsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commission Settings</DialogTitle>
          </DialogHeader>
          {rates && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateRates.mutate({
                  enabled: formData.get('enabled') === 'on',
                  level1Commission: Number(formData.get('level1Commission')),
                  level2Commission: Number(formData.get('level2Commission')),
                  level3Commission: Number(formData.get('level3Commission')),
                  minWithdrawalAmount: Number(formData.get('minWithdrawalAmount')),
                  commissionType: formData.get('commissionType') as 'percentage' | 'fixed',
                });
              }}
              className="space-y-4"
            >
              <div>
                <Label className="flex items-center gap-2">
                  <input type="checkbox" name="enabled" defaultChecked={rates.enabled} />
                  Enable Referral Program
                </Label>
              </div>
              <div>
                <Label htmlFor="level1Commission">Level 1 Commission (%)</Label>
                <Input
                  id="level1Commission"
                  name="level1Commission"
                  type="number"
                  step="0.1"
                  defaultValue={rates.level1Commission}
                />
              </div>
              <div>
                <Label htmlFor="level2Commission">Level 2 Commission (%)</Label>
                <Input
                  id="level2Commission"
                  name="level2Commission"
                  type="number"
                  step="0.1"
                  defaultValue={rates.level2Commission}
                />
              </div>
              <div>
                <Label htmlFor="level3Commission">Level 3 Commission (%)</Label>
                <Input
                  id="level3Commission"
                  name="level3Commission"
                  type="number"
                  step="0.1"
                  defaultValue={rates.level3Commission}
                />
              </div>
              <div>
                <Label htmlFor="minWithdrawalAmount">Min Withdrawal Amount (USDT)</Label>
                <Input
                  id="minWithdrawalAmount"
                  name="minWithdrawalAmount"
                  type="number"
                  step="0.01"
                  defaultValue={rates.minWithdrawalAmount}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setSettingsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateRates.isPending}>
                  {updateRates.isPending ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Referrals;
