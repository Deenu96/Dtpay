import React, { useState } from 'react';
import { Search, Filter, Eye, XCircle, MoreHorizontal } from 'lucide-react';
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
import { useOrders, useOrder, useCancelOrder } from '@/hooks/useOrders';
import { OrderStatus, OrderType } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';

const Orders: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [type, setType] = useState<OrderType | ''>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const { data, isLoading } = useOrders({
    page,
    limit,
    status: status || undefined,
    type: type || undefined,
  });

  const { data: orderDetail } = useOrder(selectedOrderId || '');
  const cancelOrder = useCancelOrder();

  const orders = data?.data.data || [];
  const total = data?.data.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleCancel = async () => {
    if (selectedOrderId) {
      await cancelOrder.mutateAsync({ id: selectedOrderId, reason: 'Cancelled by admin' });
      setCancelModalOpen(false);
      setSelectedOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="text-muted-foreground">Manage P2P trading orders</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search orders..." className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Select
                value={type}
                onValueChange={(value) => {
                  setType(value as OrderType);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value as OrderStatus);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders ({total})</CardTitle>
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
                      <TableHead>Order ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order: { id: string; userName: string; type: string; price: number; amount: number; status: string; createdAt: string }) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                          <TableCell>{order.userName}</TableCell>
                          <TableCell>
                            <span className={`capitalize font-medium ${order.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                              {order.type}
                            </span>
                          </TableCell>
                          <TableCell>{formatCurrency(order.price, 'USDT')}</TableCell>
                          <TableCell>{formatCurrency(order.amount, 'USDT')}</TableCell>
                          <TableCell>
                            <StatusBadge status={order.status as 'active' | 'pending' | 'completed' | 'cancelled'} />
                          </TableCell>
                          <TableCell>{formatDate(order.createdAt, 'MMM dd, yyyy')}</TableCell>
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
                                    setSelectedOrderId(order.id);
                                    setViewModalOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {order.status === 'active' && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedOrderId(order.id);
                                      setCancelModalOpen(true);
                                    }}
                                    className="text-red-500"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel Order
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

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {orderDetail?.data && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-medium">{orderDetail.data.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{orderDetail.data.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">{formatCurrency(orderDetail.data.price, 'USDT')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatCurrency(orderDetail.data.amount, 'USDT')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Modal */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedOrderId(null);
        }}
        onConfirm={handleCancel}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Cancel Order"
        confirmVariant="destructive"
        isLoading={cancelOrder.isPending}
      />
    </div>
  );
};

export default Orders;
