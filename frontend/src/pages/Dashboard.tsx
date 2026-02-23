import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ShoppingCart,
  List,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWalletContext } from '@/context/WalletContext';
import { useMyOrders, useCurrentPrice } from '@/hooks/useOrders';
import { useMyTrades } from '@/hooks/useTrades';
import BalanceCard from '@/components/wallet/BalanceCard';
import TransactionList from '@/components/wallet/TransactionList';
import OrderBook from '@/components/trading/OrderBook';
import { formatINR, formatUSDT, formatPrice } from '@/utils/formatters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { balance, isLoading: isWalletLoading } = useWalletContext();
  const { data: ordersData } = useMyOrders({ limit: 5 });
  const { data: tradesData } = useMyTrades({ limit: 5 });
  const { data: priceData } = useCurrentPrice();

  const quickActions = [
    {
      label: 'Buy USDT',
      href: '/buy',
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      label: 'Sell USDT',
      href: '/sell',
      icon: TrendingUp,
      color: 'bg-red-500',
    },
    {
      label: 'Deposit',
      href: '/deposit',
      icon: TrendingDown,
      color: 'bg-blue-500',
    },
    {
      label: 'Withdraw',
      href: '/withdraw',
      icon: Wallet,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your account.
          </p>
        </div>
        {priceData && (
          <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
            <span className="text-sm text-muted-foreground">USDT/INR</span>
            <span className="font-semibold">{formatPrice(priceData.price)}</span>
            <Badge
              variant={priceData.change24h >= 0 ? 'success' : 'destructive'}
              className="text-xs"
            >
              {priceData.change24h >= 0 ? '+' : ''}
              {priceData.change24h.toFixed(2)}%
            </Badge>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link key={action.label} to={action.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className={`${action.color} p-3 rounded-full mb-2`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Balance Cards */}
      <BalanceCard
        balance={balance}
        isLoading={isWalletLoading}
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Book */}
        <div className="lg:col-span-1">
          <OrderBook compact />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Active Orders</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/orders">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {ordersData?.data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <List className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No active orders</p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link to="/buy">Create Order</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {ordersData?.data.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={order.type === 'buy' ? 'success' : 'destructive'}
                        >
                          {order.type.toUpperCase()}
                        </Badge>
                        <div>
                          <p className="font-medium">{formatPrice(order.price)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatUSDT(order.remainingAmount)} remaining
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatINR(order.price * order.remainingAmount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.paymentMethods.join(', ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Trades */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Trades</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/orders">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {tradesData?.data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No recent trades</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tradesData?.data.slice(0, 3).map((trade) => (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            trade.type === 'buy'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {trade.type === 'buy' ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{trade.type} USDT</p>
                          <p className="text-sm text-muted-foreground">
                            {formatUSDT(trade.amount)} @ {formatPrice(trade.price)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatINR(trade.total)}</p>
                        <Badge
                          variant={
                            trade.status === 'completed'
                              ? 'success'
                              : trade.status === 'pending'
                              ? 'warning'
                              : 'default'
                          }
                          className="text-xs"
                        >
                          {trade.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <TransactionList limit={5} showPagination={false} />
    </div>
  );
};

export default Dashboard;
