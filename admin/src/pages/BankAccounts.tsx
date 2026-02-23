import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Landmark, MoreHorizontal } from 'lucide-react';
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
import Pagination from '@/components/common/Pagination';
import ConfirmModal from '@/components/common/ConfirmModal';
import { bankAccountService } from '@/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { formatDate, maskBankAccount } from '@/utils/formatters';

const BankAccounts: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [verified, setVerified] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [unverifyModalOpen, setUnverifyModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['bankAccounts', page, limit, verified],
    queryFn: () =>
      bankAccountService.getBankAccounts({
        page,
        limit,
        verified: verified === '' ? undefined : verified === 'true',
      }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['bankStats'],
    queryFn: () => bankAccountService.getBankStats(),
  });

  const verifyAccount = useMutation({
    mutationFn: (id: string) => bankAccountService.verifyBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toast.success('Bank account verified successfully');
      setVerifyModalOpen(false);
      setSelectedAccountId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to verify account');
    },
  });

  const unverifyAccount = useMutation({
    mutationFn: (id: string) => bankAccountService.unverifyBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toast.success('Bank account unverified');
      setUnverifyModalOpen(false);
      setSelectedAccountId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unverify account');
    },
  });

  const accounts = data?.data.data || [];
  const total = data?.data.total || 0;
  const totalPages = Math.ceil(total / limit);
  const stats = statsData?.data;

  const handleVerify = async () => {
    if (selectedAccountId) {
      await verifyAccount.mutateAsync(selectedAccountId);
    }
  };

  const handleUnverify = async () => {
    if (selectedAccountId) {
      await unverifyAccount.mutateAsync(selectedAccountId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Bank Accounts</h1>
          <p className="text-muted-foreground">Manage user bank accounts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Accounts</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <Landmark className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold">{stats?.verified || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unverified</p>
                <p className="text-2xl font-bold">{stats?.unverified || 0}</p>
              </div>
              <XCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usage Count</p>
                <p className="text-2xl font-bold">{stats?.usageCount || 0}</p>
              </div>
              <Landmark className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search bank accounts..." className="pl-10" />
            </div>
            <Select
              value={verified}
              onValueChange={(value) => {
                setVerified(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="true">Verified</SelectItem>
                <SelectItem value="false">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bank Accounts ({total})</CardTitle>
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
                      <TableHead>Account Number</TableHead>
                      <TableHead>Account Holder</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>IFSC</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No bank accounts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      accounts.map((account: { id: string; userName: string; accountNumber: string; accountHolderName: string; bankName: string; ifscCode: string; isVerified: boolean; createdAt: string }) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.userName}</TableCell>
                          <TableCell>{maskBankAccount(account.accountNumber)}</TableCell>
                          <TableCell>{account.accountHolderName}</TableCell>
                          <TableCell>{account.bankName}</TableCell>
                          <TableCell>{account.ifscCode}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              account.isVerified
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-orange-500/10 text-orange-500'
                            }`}>
                              {account.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {!account.isVerified ? (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedAccountId(account.id);
                                      setVerifyModalOpen(true);
                                    }}
                                    className="text-green-500"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Verify
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedAccountId(account.id);
                                      setUnverifyModalOpen(true);
                                    }}
                                    className="text-orange-500"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Unverify
                                  </DropdownMenuItem>
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

      {/* Verify Modal */}
      <ConfirmModal
        isOpen={verifyModalOpen}
        onClose={() => {
          setVerifyModalOpen(false);
          setSelectedAccountId(null);
        }}
        onConfirm={handleVerify}
        title="Verify Bank Account"
        description="Are you sure you want to verify this bank account?"
        confirmText="Verify"
        isLoading={verifyAccount.isPending}
      />

      {/* Unverify Modal */}
      <ConfirmModal
        isOpen={unverifyModalOpen}
        onClose={() => {
          setUnverifyModalOpen(false);
          setSelectedAccountId(null);
        }}
        onConfirm={handleUnverify}
        title="Unverify Bank Account"
        description="Are you sure you want to unverify this bank account?"
        confirmText="Unverify"
        confirmVariant="destructive"
        isLoading={unverifyAccount.isPending}
      />
    </div>
  );
};

export default BankAccounts;
