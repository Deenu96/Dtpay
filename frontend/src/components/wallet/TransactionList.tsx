import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTransactions } from '@/hooks/useWallet';
import { formatINR, formatUSDT, formatDateTime } from '@/utils/formatters';
import { cn } from '@/utils/helpers';
import type { Transaction } from '@/types';

interface TransactionListProps {
  limit?: number;
  showPagination?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({
  limit = 10,
  showPagination = true,
}) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useTransactions({ page, limit });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'trade':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'fee':
        return <ArrowUpRight className="h-4 w-4 text-orange-500" />;
      case 'referral':
        return <ArrowDownRight className="h-4 w-4 text-purple-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
      pending: 'warning',
      completed: 'success',
      failed: 'destructive',
      cancelled: 'default',
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const transactions = data?.data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{transaction.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'font-medium',
                        transaction.type === 'deposit' || transaction.type === 'referral'
                          ? 'text-green-500'
                          : 'text-red-500'
                      )}
                    >
                      {transaction.type === 'deposit' || transaction.type === 'referral'
                        ? '+'
                        : '-'}
                      {transaction.currency === 'USDT'
                        ? formatUSDT(transaction.amount)
                        : formatINR(transaction.amount)}
                    </p>
                    <div className="mt-1">{getStatusBadge(transaction.status)}</div>
                  </div>
                </div>
              ))}
            </div>

            {showPagination && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
