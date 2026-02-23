import React, { useState } from 'react';
import { Search, Plus, Minus, Wallet } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import Pagination from '@/components/common/Pagination';
import { useWallets, useAdjustBalance } from '@/hooks/useWallets';
import { formatCurrency } from '@/utils/formatters';

const Wallets: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState('');
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<{ userId: string; currency: string; balance: number } | null>(null);
  const [adjustType, setAdjustType] = useState<'add' | 'deduct'>('add');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const { data, isLoading } = useWallets({
    page,
    limit,
    search: search || undefined,
  });

  const adjustBalance = useAdjustBalance();

  const wallets = data?.data.data || [];
  const total = data?.data.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleAdjust = async () => {
    if (selectedWallet && adjustAmount && adjustReason) {
      await adjustBalance.mutateAsync({
        userId: selectedWallet.userId,
        currency: selectedWallet.currency,
        amount: parseFloat(adjustAmount),
        type: adjustType,
        reason: adjustReason,
      });
      setAdjustModalOpen(false);
      setSelectedWallet(null);
      setAdjustAmount('');
      setAdjustReason('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Wallets</h1>
          <p className="text-muted-foreground">Manage user wallet balances</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Wallets</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by user name or ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Wallets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Wallets</CardTitle>
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
                      <TableHead>User</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Frozen</TableHead>
                      <TableHead>Total Deposited</TableHead>
                      <TableHead>Total Withdrawn</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wallets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No wallets found
                        </TableCell>
                      </TableRow>
                    ) : (
                      wallets.map((wallet) => (
                        <TableRow key={wallet.id}>
                          <TableCell className="font-medium">{wallet.userId}</TableCell>
                          <TableCell>{wallet.currency}</TableCell>
                          <TableCell>{formatCurrency(wallet.balance, wallet.currency)}</TableCell>
                          <TableCell>{formatCurrency(wallet.frozenBalance, wallet.currency)}</TableCell>
                          <TableCell>{formatCurrency(wallet.totalDeposited, wallet.currency)}</TableCell>
                          <TableCell>{formatCurrency(wallet.totalWithdrawn, wallet.currency)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedWallet({
                                    userId: wallet.userId,
                                    currency: wallet.currency,
                                    balance: wallet.balance,
                                  });
                                  setAdjustType('add');
                                  setAdjustModalOpen(true);
                                }}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedWallet({
                                    userId: wallet.userId,
                                    currency: wallet.currency,
                                    balance: wallet.balance,
                                  });
                                  setAdjustType('deduct');
                                  setAdjustModalOpen(true);
                                }}
                              >
                                <Minus className="w-4 h-4 mr-1" />
                                Deduct
                              </Button>
                            </div>
                          </TableCell>
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

      {/* Adjust Balance Modal */}
      <Dialog open={adjustModalOpen} onOpenChange={setAdjustModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adjustType === 'add' ? 'Add Balance' : 'Deduct Balance'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Currency</Label>
              <p className="font-medium">{selectedWallet?.currency}</p>
            </div>
            <div>
              <Label>Current Balance</Label>
              <p className="font-medium">
                {selectedWallet && formatCurrency(selectedWallet.balance, selectedWallet.currency)}
              </p>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                placeholder="Enter reason..."
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAdjustModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAdjust}
                disabled={!adjustAmount || !adjustReason || adjustBalance.isPending}
                variant={adjustType === 'deduct' ? 'destructive' : 'default'}
              >
                {adjustBalance.isPending
                  ? 'Processing...'
                  : adjustType === 'add'
                  ? 'Add Balance'
                  : 'Deduct Balance'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Wallets;
