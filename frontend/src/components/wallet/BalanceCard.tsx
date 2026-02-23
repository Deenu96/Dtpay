import React from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, IndianRupee, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatINR, formatUSDT } from '@/utils/formatters';
import { cn } from '@/utils/helpers';
import type { WalletBalance } from '@/types';

interface BalanceCardProps {
  balance: WalletBalance | null;
  isLoading?: boolean;
  onDeposit?: () => void;
  onWithdraw?: () => void;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  isLoading = false,
  onDeposit,
  onWithdraw,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-8 w-32 rounded bg-muted" />
            <div className="h-4 w-48 rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* USDT Balance */}
      <Card className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-usdt/10" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            USDT Balance
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-usdt/10">
            <DollarSign className="h-4 w-4 text-usdt" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {balance ? formatUSDT(balance.usdt.available) : '0.00 USDT'}
          </div>
          {balance && balance.usdt.locked > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Locked: {formatUSDT(balance.usdt.locked)}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={onDeposit}>
              <ArrowDownRight className="mr-1 h-4 w-4" />
              Deposit
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={onWithdraw}>
              <ArrowUpRight className="mr-1 h-4 w-4" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* INR Balance */}
      <Card className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/10" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            INR Balance
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <IndianRupee className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {balance ? formatINR(balance.inr.available) : '₹0.00'}
          </div>
          {balance && balance.inr.locked > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Locked: {formatINR(balance.inr.locked)}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={onDeposit}>
              <ArrowDownRight className="mr-1 h-4 w-4" />
              Deposit
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={onWithdraw}>
              <ArrowUpRight className="mr-1 h-4 w-4" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceCard;
