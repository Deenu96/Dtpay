import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Filter,
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMyOrders, useCancelOrder } from '@/hooks/useOrders';
import { formatINR, formatUSDT, formatDateTime, formatStatus } from '@/utils/formatters';
import { cn } from '@/utils/helpers';
import type { Order } from '@/types';

const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const { data: ordersData, isLoading, refetch } = useMyOrders({
    status: activeTab,
    limit: 20,
  });
  const cancelOrder = useCancelOrder();

  const handleCancel = async (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      await cancelOrder.mutateAsync(orderId);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
      active: 'success',
      filled: 'default',
      cancelled: 'destructive',
      expired: 'warning',
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {formatStatus(status)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">
            Manage your buy and sell orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => navigate('/buy')}>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="filled">Filled</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : ordersData?.data.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">No orders found</p>
                  <Button onClick={() => navigate('/buy')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Order
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Filled</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordersData?.data.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3">
                            <Badge
                              variant={order.type === 'buy' ? 'success' : 'destructive'}
                            >
                              {order.type.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {formatINR(order.price)}
                          </td>
                          <td className="px-4 py-3">
                            {formatUSDT(order.amount)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{
                                    width: `${(order.filledAmount / order.amount) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {((order.filledAmount / order.amount) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatDateTime(order.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {order.status === 'active' && (
                                  <>
                                    <DropdownMenuItem>
                                      <Edit2 className="mr-2 h-4 w-4" />
                                      Edit Order
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleCancel(order.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Cancel Order
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyOrders;
