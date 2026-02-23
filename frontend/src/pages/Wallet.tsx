import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  History,
  TrendingUp,
  TrendingDown,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWalletContext } from '@/context/WalletContext';
import { useTransactions } from '@/hooks/useWallet';
import BalanceCard from '@/components/wallet/BalanceCard';
import TransactionList from '@/components/wallet/TransactionList';
import { formatINR, formatUSDT, formatDateTime } from '@/utils/formatters';
import { copyToClipboard } from '@/utils/helpers';
import toast from 'react-hot-toast';

const WalletPage: React.FC = () => {
  const { balance, isLoading } = useWalletContext();
  const [activeTab, setActiveTab] = useState('overview');

  const quickStats = [
    {
      label: 'Total Balance',
      value: balance
        ? `₹${(balance.inr.total + balance.usdt.total * 83.5).toLocaleString()}`
        : '₹0',
      icon: Wallet,
      color: 'bg-blue-500',
    },
    {
      label: 'Available USDT',
      value: balance ? formatUSDT(balance.usdt.available) : '0 USDT',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      label: 'Locked USDT',
      value: balance ? formatUSDT(balance.usdt.locked) : '0 USDT',
      icon: TrendingDown,
      color: 'bg-orange-500',
    },
    {
      label: 'Available INR',
      value: balance ? formatINR(balance.inr.available) : '₹0',
      icon: Wallet,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wallet</h1>
          <p className="text-muted-foreground">
            Manage your USDT and INR balances
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/deposit">
              <ArrowDownRight className="mr-2 h-4 w-4" />
              Deposit
            </Link>
          </Button>
          <Button asChild>
            <Link to="/withdraw">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Withdraw
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Balance Cards */}
      <BalanceCard balance={balance} isLoading={isLoading} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <TransactionList limit={5} showPagination={false} />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <TransactionList />
        </TabsContent>

        <TabsContent value="deposits" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                      <ArrowDownRight className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Deposit INR</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Deposit INR via UPI or Bank Transfer
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/deposit?currency=INR">Deposit INR</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mx-auto mb-4">
                      <Wallet className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Deposit USDT</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Deposit USDT to your wallet address
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/deposit?currency=USDT">Deposit USDT</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mx-auto mb-4">
                      <ArrowUpRight className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Withdraw INR</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Withdraw INR to your bank account
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/withdraw?currency=INR">Withdraw INR</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mx-auto mb-4">
                      <ExternalLink className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Withdraw USDT</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Withdraw USDT to external wallet
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/withdraw?currency=USDT">Withdraw USDT</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletPage;
