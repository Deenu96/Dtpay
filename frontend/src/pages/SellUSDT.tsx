import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useBuyOrders, useCreateOrder, useCurrentPrice } from '@/hooks/useOrders';
import { useCreateTrade } from '@/hooks/useTrades';
import OrderCard from '@/components/trading/OrderCard';
import OrderBook from '@/components/trading/OrderBook';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatPrice, formatINR, formatUSDT } from '@/utils/formatters';
import { cn } from '@/utils/helpers';
import type { Order } from '@/types';
import toast from 'react-hot-toast';

const SellUSDT: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'market' | 'create'>('market');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [tradeAmount, setTradeAmount] = useState('');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  // Create order form state
  const [createForm, setCreateForm] = useState({
    price: '',
    amount: '',
    minAmount: '',
    maxAmount: '',
    paymentMethods: [] as string[],
    terms: '',
  });

  const { data: ordersData, isLoading, refetch } = useBuyOrders({ limit: 20 });
  const { data: priceData } = useCurrentPrice();
  const createOrder = useCreateOrder();
  const createTrade = useCreateTrade();

  const paymentMethods = ['UPI', 'Bank Transfer', 'Paytm', 'PhonePe', 'Google Pay'];

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

  const handleCreateOrder = async () => {
    if (!createForm.price || !createForm.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createOrder.mutateAsync({
        type: 'sell',
        price: parseFloat(createForm.price),
        amount: parseFloat(createForm.amount),
        minAmount: parseFloat(createForm.minAmount) || 100,
        maxAmount: parseFloat(createForm.maxAmount) || parseFloat(createForm.amount),
        paymentMethods: createForm.paymentMethods.length > 0 ? createForm.paymentMethods : ['UPI'],
        terms: createForm.terms,
      });
      setActiveTab('market');
      setCreateForm({
        price: '',
        amount: '',
        minAmount: '',
        maxAmount: '',
        paymentMethods: [],
        terms: '',
      });
    } catch {
      // Error handled by mutation
    }
  };

  const togglePaymentMethod = (method: string) => {
    setCreateForm((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter((m) => m !== method)
        : [...prev.paymentMethods, method],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sell USDT</h1>
          <p className="text-muted-foreground">
            Find buy orders or create your own sell order
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setActiveTab('create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          className={cn(
            'px-4 py-2 font-medium transition-colors',
            activeTab === 'market'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setActiveTab('market')}
        >
          Market Orders
        </button>
        <button
          className={cn(
            'px-4 py-2 font-medium transition-colors',
            activeTab === 'create'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setActiveTab('create')}
        >
          Create Order
        </button>
      </div>

      {activeTab === 'market' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Book */}
          <div className="lg:col-span-1">
            <OrderBook />
          </div>

          {/* Orders List */}
          <div className="lg:col-span-2">
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
                  <p className="text-muted-foreground">No buy orders found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your own sell order to start trading
                  </p>
                  <Button className="mt-4" onClick={() => setActiveTab('create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Order
                  </Button>
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
      ) : (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Create Sell Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Price (INR)</label>
                <Input
                  type="number"
                  placeholder="Enter price per USDT"
                  value={createForm.price}
                  onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                />
                {priceData && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Market price: {formatPrice(priceData.price)}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Amount (USDT)</label>
                <Input
                  type="number"
                  placeholder="Enter amount to sell"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Min Amount (INR)</label>
                <Input
                  type="number"
                  placeholder="Minimum order amount"
                  value={createForm.minAmount}
                  onChange={(e) => setCreateForm({ ...createForm, minAmount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Max Amount (INR)</label>
                <Input
                  type="number"
                  placeholder="Maximum order amount"
                  value={createForm.maxAmount}
                  onChange={(e) => setCreateForm({ ...createForm, maxAmount: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Payment Methods</label>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method}
                    onClick={() => togglePaymentMethod(method)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm transition-colors',
                      createForm.paymentMethods.includes(method)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Terms (Optional)</label>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Add any terms or conditions for this trade..."
                value={createForm.terms}
                onChange={(e) => setCreateForm({ ...createForm, terms: e.target.value })}
              />
            </div>

            {createForm.price && createForm.amount && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Total Value</span>
                  <span className="font-semibold">
                    {formatINR(parseFloat(createForm.price) * parseFloat(createForm.amount))}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setActiveTab('market')}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateOrder}
                loading={createOrder.isPending}
                disabled={!createForm.price || !createForm.amount}
              >
                Create Sell Order
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trade Modal */}
      <Dialog open={isTradeModalOpen} onOpenChange={setIsTradeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sell USDT</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-semibold">{formatPrice(selectedOrder.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wants to buy</p>
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
                    <span className="text-sm text-muted-foreground">You will sell</span>
                    <span className="font-semibold">
                      {formatUSDT(parseFloat(tradeAmount) / selectedOrder.price)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">You will receive</span>
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
                Sell USDT
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellUSDT;
