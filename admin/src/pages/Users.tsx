import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal, Ban, CheckCircle, Edit } from 'lucide-react';
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
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useUsers, useBanUser, useUnbanUser } from '@/hooks/useUsers';
import { User, Status, KYCStatus } from '@/types';
import { formatDate, formatCurrency } from '@/utils/formatters';

const Users: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<Status | ''>('');
  const [kycStatus, setKycStatus] = useState<KYCStatus | ''>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [unbanModalOpen, setUnbanModalOpen] = useState(false);

  const { data, isLoading } = useUsers({
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    kycStatus: kycStatus || undefined,
  });

  const banUser = useBanUser();
  const unbanUser = useUnbanUser();

  const handleBan = async () => {
    if (selectedUser) {
      await banUser.mutateAsync({ id: selectedUser.id, reason: 'Banned by admin' });
      setBanModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleUnban = async () => {
    if (selectedUser) {
      await unbanUser.mutateAsync(selectedUser.id);
      setUnbanModalOpen(false);
      setSelectedUser(null);
    }
  };

  const users = data?.data.data || [];
  const total = data?.data.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="text-muted-foreground">Manage platform users</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value as Status);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={kycStatus}
                onValueChange={(value) => {
                  setKycStatus(value as KYCStatus);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="KYC Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All KYC</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({total})</CardTitle>
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
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>KYC</TableHead>
                      <TableHead>Trading Volume</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Link
                              to={`/users/${user.id}`}
                              className="font-medium hover:text-primary"
                            >
                              {user.name}
                            </Link>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>
                            <StatusBadge status={user.status} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={user.kycStatus} />
                          </TableCell>
                          <TableCell>{formatCurrency(user.tradingVolume, 'USDT')}</TableCell>
                          <TableCell>{formatDate(user.createdAt, 'MMM dd, yyyy')}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/users/${user.id}`}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                {user.status === 'active' ? (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setBanModalOpen(true);
                                    }}
                                    className="text-red-500"
                                  >
                                    <Ban className="w-4 h-4 mr-2" />
                                    Ban User
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setUnbanModalOpen(true);
                                    }}
                                    className="text-green-500"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Unban User
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

      {/* Ban Modal */}
      <ConfirmModal
        isOpen={banModalOpen}
        onClose={() => {
          setBanModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleBan}
        title="Ban User"
        description={`Are you sure you want to ban ${selectedUser?.name}? This will prevent them from accessing the platform.`}
        confirmText="Ban User"
        confirmVariant="destructive"
        isLoading={banUser.isPending}
      />

      {/* Unban Modal */}
      <ConfirmModal
        isOpen={unbanModalOpen}
        onClose={() => {
          setUnbanModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleUnban}
        title="Unban User"
        description={`Are you sure you want to unban ${selectedUser?.name}? This will restore their access to the platform.`}
        confirmText="Unban User"
        isLoading={unbanUser.isPending}
      />
    </div>
  );
};

export default Users;
