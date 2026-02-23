import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Pagination from '@/components/common/Pagination';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useWithdrawals, useWithdrawal, useApproveWithdrawal, useRejectWithdrawal } from '@/hooks/useTransactions';
import { TransactionStatus } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';

const Withdrawals: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [status, setStatus] = useState<TransactionStatus | ''>('pending');
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data, isLoading } = useWithdrawals({
    page,
    limit,
    status: status || undefined,
  });

  const { data: withdrawalDetail } = useWithdrawal(selectedWithdrawalId || '');
  const approveWithdrawal = useApproveWithdrawal();
  const rejectWithdrawal = useRejectWithdrawal();

  const withdrawals = data?.data.data || [];
  const total = data?.data.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleApprove = async () => {
    if (selectedWithdrawalId) {
      await approveWithdrawal.mutateAsync({ id: selectedWithdrawalId });
      setApproveModalOpen(false);
      setSelectedWithdrawalId(null);
    }
  };

  const handleReject = async () => {
    if (selectedWithdrawalId && rejectionReason) {
      await rejectWithdrawal.mutateAsync({ id: selectedWithdrawalId, reason: rejectionReason });
      setRejectModalOpen(false);
      setSelectedWithdrawalId(null);
      setRejectionReason('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Withdrawals</h1>
          <p className="text-muted-foreground">Manage and process user withdrawals</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search withdrawals..." className="pl-10" />
            </div>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as TransactionStatus);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Withdrawals ({total})</CardTitle>
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
                      <TableHead>Withdrawal ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Net Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No withdrawals found
                        </TableCell>
                      </TableRow>
                    ) : (
                      withdrawals.map((withdrawal: { id: string; userName: string; amount: number; fee: number; netAmount: number; currency: string; paymentMethod: string; status: string; createdAt: string }) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell className="font-medium">#{withdrawal.id.slice(-6)}</TableCell>
                          <TableCell>{withdrawal.userName}</TableCell>
                          <TableCell>{formatCurrency(withdrawal.amount, withdrawal.currency)}</TableCell>
                          <TableCell>{formatCurrency(withdrawal.fee, withdrawal.currency)}</TableCell>
                          <TableCell>{formatCurrency(withdrawal.netAmount, withdrawal.currency)}</TableCell>
                          <TableCell className="capitalize">{withdrawal.paymentMethod}</TableCell>
                          <TableCell>
                            <StatusBadge status={withdrawal.status as 'pending' | 'approved' | 'rejected'} />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedWithdrawalId(withdrawal.id);
                                    setViewModalOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {withdrawal.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedWithdrawalId(withdrawal.id);
                                        setApproveModalOpen(true);
                                      }}
                                      className="text-green-500"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedWithdrawalId(withdrawal.id);
                                        setRejectModalOpen(true);
                                      }}
                                      className="text-red-500"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
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

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Withdrawal Details</DialogTitle>
          </DialogHeader>
          {withdrawalDetail?.data && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Withdrawal ID</p>
                  <p className="font-medium">{withdrawalDetail.data.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={withdrawalDetail.data.status as 'pending' | 'approved' | 'rejected'} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatCurrency(withdrawalDetail.data.amount, withdrawalDetail.data.currency)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fee</p>
                  <p className="font-medium">{formatCurrency(withdrawalDetail.data.fee, withdrawalDetail.data.currency)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Amount</p>
                  <p className="font-medium">{formatCurrency(withdrawalDetail.data.netAmount, withdrawalDetail.data.currency)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{withdrawalDetail.data.paymentMethod}</p>
                </div>
                {withdrawalDetail.data.upiId && (
                  <div>
                    <p className="text-sm text-muted-foreground">UPI ID</p>
                    <p className="font-medium">{withdrawalDetail.data.upiId}</p>
                  </div>
                )}
                {withdrawalDetail.data.walletAddress && (
                  <div>
                    <p className="text-sm text-muted-foreground">Wallet Address</p>
                    <p className="font-medium">{withdrawalDetail.data.walletAddress}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Modal */}
      <ConfirmModal
        isOpen={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
          setSelectedWithdrawalId(null);
        }}
        onConfirm={handleApprove}
        title="Approve Withdrawal"
        description="Are you sure you want to approve this withdrawal? The amount will be transferred to the user's account."
        confirmText="Approve"
        isLoading={approveWithdrawal.isPending}
      />

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Please provide a reason for rejecting this withdrawal.
            </p>
            <textarea
              className="w-full p-3 border rounded-md bg-background"
              rows={4}
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason || rejectWithdrawal.isPending}
              >
                {rejectWithdrawal.isPending ? 'Rejecting...' : 'Reject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Withdrawals;
