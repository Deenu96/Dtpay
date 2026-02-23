import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { useKYCSubmissions, useApproveKYC, useRejectKYC, useKYCDetail } from '@/hooks/useKYC';
import { KYCStatus } from '@/types';
import { formatDate } from '@/utils/formatters';

const KYC: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [status, setStatus] = useState<KYCStatus | ''>('pending');
  const [selectedKYCId, setSelectedKYCId] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data, isLoading } = useKYCSubmissions({
    page,
    limit,
    status: status || undefined,
  });

  const { data: kycDetail } = useKYCDetail(selectedKYCId || '');
  const approveKYC = useApproveKYC();
  const rejectKYC = useRejectKYC();

  const kycs = data?.data.data || [];
  const total = data?.data.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleApprove = async () => {
    if (selectedKYCId) {
      await approveKYC.mutateAsync({ id: selectedKYCId });
      setApproveModalOpen(false);
      setSelectedKYCId(null);
    }
  };

  const handleReject = async () => {
    if (selectedKYCId && rejectionReason) {
      await rejectKYC.mutateAsync({ id: selectedKYCId, reason: rejectionReason });
      setRejectModalOpen(false);
      setSelectedKYCId(null);
      setRejectionReason('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">KYC Verification</h1>
          <p className="text-muted-foreground">Manage user identity verification</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by user name..." className="pl-10" />
            </div>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as KYCStatus);
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

      {/* KYC Table */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Submissions ({total})</CardTitle>
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
                      <TableHead>Full Name</TableHead>
                      <TableHead>ID Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kycs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No KYC submissions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      kycs.map((kyc) => (
                        <TableRow key={kyc.id}>
                          <TableCell className="font-medium">{kyc.user?.name}</TableCell>
                          <TableCell>{kyc.fullName}</TableCell>
                          <TableCell className="capitalize">{kyc.idType}</TableCell>
                          <TableCell>
                            <StatusBadge status={kyc.status} />
                          </TableCell>
                          <TableCell>{formatDate(kyc.submittedAt)}</TableCell>
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
                                    setSelectedKYCId(kyc.id);
                                    setViewModalOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {kyc.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedKYCId(kyc.id);
                                        setApproveModalOpen(true);
                                      }}
                                      className="text-green-500"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedKYCId(kyc.id);
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
            <DialogTitle>KYC Details</DialogTitle>
          </DialogHeader>
          {kycDetail?.data && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{kycDetail.data.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{kycDetail.data.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p className="font-medium">{kycDetail.data.nationality}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID Type</p>
                  <p className="font-medium capitalize">{kycDetail.data.idType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID Number</p>
                  <p className="font-medium">{kycDetail.data.idNumber}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{kycDetail.data.address}</p>
              </div>
              {kycDetail.data.status === 'rejected' && kycDetail.data.rejectionReason && (
                <div className="p-4 bg-red-500/10 rounded-lg">
                  <p className="text-sm text-red-500 font-medium">Rejection Reason</p>
                  <p className="text-red-500">{kycDetail.data.rejectionReason}</p>
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
          setSelectedKYCId(null);
        }}
        onConfirm={handleApprove}
        title="Approve KYC"
        description="Are you sure you want to approve this KYC submission? This will verify the user's identity."
        confirmText="Approve"
        isLoading={approveKYC.isPending}
      />

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Please provide a reason for rejecting this KYC submission.
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
                disabled={!rejectionReason || rejectKYC.isPending}
              >
                {rejectKYC.isPending ? 'Rejecting...' : 'Reject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KYC;
