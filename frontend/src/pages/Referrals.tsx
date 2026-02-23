import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Copy,
  Gift,
  TrendingUp,
  ChevronRight,
  Share2,
  Wallet,
  UserPlus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReferralStats, useReferralLink, useEarnings, useClaimEarnings } from '@/hooks/useReferral';
import { copyToClipboard } from '@/utils/helpers';
import { formatUSDT } from '@/utils/formatters';
import toast from 'react-hot-toast';

const Referrals: React.FC = () => {
  const { data: stats } = useReferralStats();
  const { data: referralLink } = useReferralLink();
  const { data: earningsData } = useEarnings({ limit: 10 });
  const claimEarnings = useClaimEarnings();

  const handleCopyLink = async () => {
    if (referralLink?.link) {
      const success = await copyToClipboard(referralLink.link);
      if (success) {
        toast.success('Referral link copied!');
      }
    }
  };

  const handleCopyCode = async () => {
    if (referralLink?.code) {
      const success = await copyToClipboard(referralLink.code);
      if (success) {
        toast.success('Referral code copied!');
      }
    }
  };

  const commissionStructure = [
    { level: 1, percentage: 50, description: 'Direct referrals' },
    { level: 2, percentage: 20, description: 'Level 2 referrals' },
    { level: 3, percentage: 10, description: 'Level 3 referrals' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Referral Program</h1>
        <p className="text-muted-foreground">
          Invite friends and earn commissions on their trades
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">{stats?.totalReferrals || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 p-2 rounded-lg">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">{formatUSDT(stats?.totalEarnings || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Earnings</p>
                <p className="text-2xl font-bold">{formatUSDT(stats?.pendingEarnings || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  {formatUSDT((stats?.level1Earnings || 0) + (stats?.level2Earnings || 0) + (stats?.level3Earnings || 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>Share this link with friends to earn commissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
              {referralLink?.link || 'Loading...'}
            </div>
            <Button variant="outline" onClick={handleCopyLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Referral Code</p>
              <p className="text-xl font-bold font-mono">{referralLink?.code}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCopyCode}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Commission Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Structure</CardTitle>
          <CardDescription>Earn up to 50% commission on trading fees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {commissionStructure.map((level) => (
              <div
                key={level.level}
                className="p-4 border rounded-lg text-center hover:border-primary transition-colors"
              >
                <div className="text-3xl font-bold text-primary mb-1">
                  {level.percentage}%
                </div>
                <p className="font-medium">Level {level.level}</p>
                <p className="text-sm text-muted-foreground">{level.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="earnings">
        <TabsList>
          <TabsTrigger value="earnings">Earnings History</TabsTrigger>
          <TabsTrigger value="referrals">My Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Earnings History</CardTitle>
                <CardDescription>Your referral commission earnings</CardDescription>
              </div>
              {stats && stats.pendingEarnings > 0 && (
                <Button
                  onClick={() => claimEarnings.mutate()}
                  loading={claimEarnings.isPending}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Claim {formatUSDT(stats.pendingEarnings)}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {earningsData?.data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No earnings yet</p>
                  <p className="text-sm">Start referring friends to earn commissions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {earningsData?.data.map((earning) => (
                    <div
                      key={earning.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Gift className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            Level {earning.level} Commission
                          </p>
                          <p className="text-sm text-muted-foreground">
                            From {earning.referred?.firstName} {earning.referred?.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          +{formatUSDT(earning.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {earning.percentage}% of fee
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Referrals</CardTitle>
              <CardDescription>People who joined using your referral code</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Referral list coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Referrals;
