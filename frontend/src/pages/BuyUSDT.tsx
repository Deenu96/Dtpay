import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSellOrders } from '@/hooks/useOrders';
import { useCreateTrade } from '@/hooks/useTrades';
import OrderCard from '@/components/trading/OrderCard';
import OrderBook from '@/components/trading/OrderBook';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatPrice, formatINR, formatUSDT } from '@/utils/formatters';
import type { Order } from '@/types';
import toast from 'react-hot-toast';

const BuyUSDT: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    paymentMethod: '',
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [tradeAmount, setTradeAmount] = useState('');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  const { data: ordersData, isLoading, refetch } = useSellOrders({
    limit: 20,
    minAmount: filters.minAmount ? parseFloat(filters.minAmount) : undefined,
    maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : undefined,
    paymentMethod: filters.paymentMethod || undefined,
  });

  const createTrade = useCreateTrade();

  const handleTrade = (order: Order) => {
    setSelectedOrder(order);
    setTradeAmount(order.minAmount.toString());
    setIsTradeModalOpen(true);
  };

  const handleCreateTrade = async () => {
    if (!selectedOrder) return;

    const amount = parseFloat(tradeAmount);
    if (amount < selectedOrder.minAmount || amount > selectedOrder.maxAmount) {
      toast.error(`Amount must be between ${formatINR(selectedOrder.minAmount)} and ${formatINR(selectedOrder.maxAmount)}`);
      return;
    }

    try {
      const trade = await createTrade.mutateAsync({
        orderId: selectedOrder.id,
        amount,
        paymentMethod: selectedOrder.paymentMethods[0],
      });
      setIsTradeModalOpen(false);
      navigate(`/trade/${trade.id}`);
    } catch {
      // Error handled by mutation
    }
  };

  const paymentMethods = ['UPI', 'Bank Transfer', 'Paytm', 'PhonePe', 'Google Pay'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Buy USDT</h1>
          <p className="text-muted-foreground">
            Find the best sell orders and buy USDT instantly
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Book */}
        <div className="lg:col-span-1">
          <OrderBook />
        </div>

        {/* Orders List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-1 block">Min Amount (INR)</label>
                  <Input
                    type="number"
                    placeholder="Min amount"
                    value={filters.minAmount}
                    onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-1 block">Max Amount (INR)</label>
                  <Input
                    type="number"
                    placeholder="Max amount"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-1 block">Payment Method</label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={filters.paymentMethod}
                    onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                  >
                    <option value="">All Methods</option>
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Grid */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-8 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : ordersData?.data.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No sell orders found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters or check back later
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {ordersData?.data.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onTrade={handleTrade}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trade Modal */}
      <Dialog open={isTradeModalOpen} onOpenChange={setIsTradeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buy USDT</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-semibold">{formatPrice(selectedOrder.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="font-semibold">{formatUSDT(selectedOrder.remainingAmount)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Amount (INR)
                </label>
                <Input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  placeholder={`${selectedOrder.minAmount} - ${selectedOrder.maxAmount}`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Limits: {formatINR(selectedOrder.minAmount)} - {formatINR(selectedOrder.maxAmount)}
                </p>
              </div>

              {tradeAmount && (
                <div className="p-4 bg-primary/5 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">You will receive</span>
                    <span className="font-semibold">
                      {formatUSDT(parseFloat(tradeAmount) / selectedOrder.price)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total to pay</span>
                    <span className="font-semibold">{formatINR(parseFloat(tradeAmount))}</span>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleCreateTrade}
                loading={createTrade.isPending}
                disabled={
                  !tradeAmount ||
                  parseFloat(tradeAmount) < selectedOrder.minAmount ||
                  parseFloat(tradeAmount) > selectedOrder.maxAmount
                }
              >
                Buy USDT
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuyUSDT;
