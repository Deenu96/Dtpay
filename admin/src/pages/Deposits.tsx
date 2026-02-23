import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye, MoreHorizontal, Image as ImageIcon } from 'lucide-react';
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
import { useDeposits, useDeposit, useApproveDeposit, useRejectDeposit } from '@/hooks/useTransactions';
import { TransactionStatus } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';

const Deposits: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [status, setStatus] = useState<TransactionStatus | ''>('pending');
  const [selectedDepositId, setSelectedDepositId] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data, isLoading } = useDeposits({
    page,
    limit,
    status: status || undefined,
  });

  const { data: depositDetail } = useDeposit(selectedDepositId || '');
  const approveDeposit = useApproveDeposit();
  const rejectDeposit = useRejectDeposit();

  const deposits = data?.data.data || [];
  const total = data?.data.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleApprove = async () => {
    if (selectedDepositId) {
      await approveDeposit.mutateAsync({ id: selectedDepositId });
      setApproveModalOpen(false);
      setSelectedDepositId(null);
    }
  };

  const handleReject = async () => {
    if (selectedDepositId && rejectionReason) {
      await rejectDeposit.mutateAsync({ id: selectedDepositId, reason: rejectionReason });
      setRejectModalOpen(false);
      setSelectedDepositId(null);
      setRejectionReason('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Deposits</h1>
          <p className="text-muted-foreground">Manage and approve user deposits</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search deposits..." className="pl-10" />
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

      {/* Deposits Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Deposits ({total})</CardTitle>
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
                      <TableHead>Deposit ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deposits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No deposits found
                        </TableCell>
                      </TableRow>
                    ) : (
                      deposits.map((deposit: { id: string; userName: string; amount: number; currency: string; paymentMethod: string; status: string; createdAt: string; paymentProof?: string }) => (
                        <TableRow key={deposit.id}>
                          <TableCell className="font-medium">#{deposit.id.slice(-6)}</TableCell>
                          <TableCell>{deposit.userName}</TableCell>
                          <TableCell>{formatCurrency(deposit.amount, deposit.currency)}</TableCell>
                          <TableCell className="capitalize">{deposit.paymentMethod}</TableCell>
                          <TableCell>
                            <StatusBadge status={deposit.status as 'pending' | 'approved' | 'rejected'} />
                          </TableCell>
                          <TableCell>{formatDate(deposit.createdAt, 'MMM dd, yyyy')}</TableCell>
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
                                    setSelectedDepositId(deposit.id);
                                    setViewModalOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {deposit.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedDepositId(deposit.id);
                                        setApproveModalOpen(true);
                                      }}
                                      className="text-green-500"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedDepositId(deposit.id);
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
            <DialogTitle>Deposit Details</DialogTitle>
          </DialogHeader>
          {depositDetail?.data && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Deposit ID</p>
                  <p className="font-medium">{depositDetail.data.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={depositDetail.data.status as 'pending' | 'approved' | 'rejected'} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatCurrency(depositDetail.data.amount, depositDetail.data.currency)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{depositDetail.data.paymentMethod}</p>
                </div>
                {depositDetail.data.upiId && (
                  <div>
                    <p className="text-sm text-muted-foreground">UPI ID</p>
                    <p className="font-medium">{depositDetail.data.upiId}</p>
                  </div>
                )}
                {depositDetail.data.transactionId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <p className="font-medium">{depositDetail.data.transactionId}</p>
                  </div>
                )}
              </div>
              {depositDetail.data.paymentProof && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Payment Proof</p>
                  <div className="border rounded-lg p-4">
                    <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-center text-sm text-muted-foreground mt-2">Payment proof image</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Modal */}
      <ConfirmModal
        isOpen={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
          setSelectedDepositId(null);
        }}
        onConfirm={handleApprove}
        title="Approve Deposit"
        description="Are you sure you want to approve this deposit? The amount will be credited to the user's wallet."
        confirmText="Approve"
        isLoading={approveDeposit.isPending}
      />

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Deposit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Please provide a reason for rejecting this deposit.
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
                disabled={!rejectionReason || rejectDeposit.isPending}
              >
                {rejectDeposit.isPending ? 'Rejecting...' : 'Reject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Deposits;
