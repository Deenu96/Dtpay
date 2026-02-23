import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Wallet,
  TrendingUp,
  Share2,
  Ban,
  CheckCircle,
  Edit,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmModal from '@/components/common/ConfirmModal';
import {
  useUser,
  useUserWallets,
  useUserOrders,
  useUserTrades,
  useBanUser,
  useUnbanUser,
} from '@/hooks/useUsers';
import {
  formatDate,
  formatCurrency,
  getInitials,
  formatNumber,
} from '@/utils/formatters';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [unbanModalOpen, setUnbanModalOpen] = useState(false);

  const { data: userData, isLoading: userLoading } = useUser(id || '');
  const { data: walletsData } = useUserWallets(id || '');
  const { data: ordersData } = useUserOrders(id || '', { page: 1, limit: 5 });
  const { data: tradesData } = useUserTrades(id || '', { page: 1, limit: 5 });

  const banUser = useBanUser();
  const unbanUser = useUnbanUser();

  const user = userData?.data;
  const wallets = walletsData?.data || [];
  const orders = ordersData?.data.data || [];
  const trades = tradesData?.data.data || [];

  const handleBan = async () => {
    if (user) {
      await banUser.mutateAsync({ id: user.id, reason: 'Banned by admin' });
      setBanModalOpen(false);
    }
  };

  const handleUnban = async () => {
    if (user) {
      await unbanUser.mutateAsync(user.id);
      setUnbanModalOpen(false);
    }
  };

  if (userLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found</p>
        <Button asChild className="mt-4">
          <Link to="/users">Back to Users</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" asChild>
        <Link to="/users">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Link>
      </Button>

      {/* User header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="text-xl bg-primary/10 text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={user.status} />
              <Badge variant="outline">KYC: {user.kycStatus}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline">
            <Lock className="w-4 h-4 mr-2" />
            Reset Password
          </Button>
          {user.status === 'active' ? (
            <Button variant="destructive" onClick={() => setBanModalOpen(true)}>
              <Ban className="w-4 h-4 mr-2" />
              Ban
            </Button>
          ) : (
            <Button variant="default" onClick={() => setUnbanModalOpen(true)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Unban
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Referral Code</p>
                    <p className="font-medium">{user.referralCode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Trading Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Trading Volume</span>
                  <span className="font-medium">
                    {formatCurrency(user.tradingVolume, 'USDT')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Orders</span>
                  <span className="font-medium">{formatNumber(orders.length)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Trades</span>
                  <span className="font-medium">{formatNumber(trades.length)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wallets">
          <Card>
            <CardHeader>
              <CardTitle>Wallets</CardTitle>
            </CardHeader>
            <CardContent>
              {wallets.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No wallets found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wallets.map((wallet) => (
                    <Card key={wallet.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">{wallet.currency}</p>
                            <p className="text-xl font-bold">
                              {formatCurrency(wallet.balance, wallet.currency)}
                            </p>
                          </div>
                          <Wallet className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Frozen</span>
                            <span>{formatCurrency(wallet.frozenBalance, wallet.currency)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No orders found</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: { id: string; type: string; status: string; amount: number; price: number; createdAt: string }) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium capitalize">{order.type} Order</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.amount, 'USDT')}</p>
                        <StatusBadge status={order.status as 'active' | 'pending' | 'completed' | 'cancelled'} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
              {trades.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No trades found</p>
              ) : (
                <div className="space-y-4">
                  {trades.map((trade: { id: string; status: string; amount: number; price: number; createdAt: string }) => (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">Trade #{trade.id.slice(-6)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(trade.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(trade.amount, 'USDT')}</p>
                        <StatusBadge status={trade.status as 'active' | 'pending' | 'completed' | 'cancelled'} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Referral Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Referral tree visualization coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ban Modal */}
      <ConfirmModal
        isOpen={banModalOpen}
        onClose={() => setBanModalOpen(false)}
        onConfirm={handleBan}
        title="Ban User"
        description={`Are you sure you want to ban ${user.name}? This will prevent them from accessing the platform.`}
        confirmText="Ban User"
        confirmVariant="destructive"
        isLoading={banUser.isPending}
      />

      {/* Unban Modal */}
      <ConfirmModal
        isOpen={unbanModalOpen}
        onClose={() => setUnbanModalOpen(false)}
        onConfirm={handleUnban}
        title="Unban User"
        description={`Are you sure you want to unban ${user.name}? This will restore their access to the platform.`}
        confirmText="Unban User"
        isLoading={unbanUser.isPending}
      />
    </div>
  );
};

export default UserDetail;
