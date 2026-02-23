import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrderBook, useCurrentPrice } from '@/hooks/useOrders';
import { formatPrice, formatNumber } from '@/utils/formatters';
import { cn } from '@/utils/helpers';

interface OrderBookProps {
  compact?: boolean;
}

const OrderBook: React.FC<OrderBookProps> = ({ compact = false }) => {
  const { data: orderBook, isLoading } = useOrderBook();
  const { data: priceData } = useCurrentPrice();
  const [activeTab, setActiveTab] = useState('all');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-6 rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const buyOrders = orderBook?.buyOrders || [];
  const sellOrders = orderBook?.sellOrders || [];
  const currentPrice = priceData?.price || 0;

  const maxBuyTotal = Math.max(...buyOrders.map((o) => o.total), 0);
  const maxSellTotal = Math.max(...sellOrders.map((o) => o.total), 0);

  return (
    <Card className={compact ? 'h-full' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Order Book</CardTitle>
          {priceData && (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{formatPrice(currentPrice)}</span>
              <span
                className={cn(
                  'text-sm',
                  priceData.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                )}
              >
                {priceData.change24h >= 0 ? '+' : ''}
                {priceData.change24h.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="buy" className="text-green-500">Buy</TabsTrigger>
            <TabsTrigger value="sell" className="text-red-500">Sell</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="space-y-1">
              {/* Sell Orders (reversed) */}
              <div className="space-y-0.5">
                {[...sellOrders].reverse().slice(0, 8).map((order, index) => (
                  <OrderRow
                    key={`sell-${index}`}
                    order={order}
                    type="sell"
                    maxTotal={maxSellTotal}
                  />
                ))}
              </div>

              {/* Current Price */}
              <div className="py-2 text-center border-y">
                <span className="text-lg font-bold">{formatPrice(currentPrice)}</span>
              </div>

              {/* Buy Orders */}
              <div className="space-y-0.5">
                {buyOrders.slice(0, 8).map((order, index) => (
                  <OrderRow
                    key={`buy-${index}`}
                    order={order}
                    type="buy"
                    maxTotal={maxBuyTotal}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="buy" className="mt-4">
            <div className="space-y-0.5">
              {buyOrders.map((order, index) => (
                <OrderRow
                  key={`buy-full-${index}`}
                  order={order}
                  type="buy"
                  maxTotal={maxBuyTotal}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sell" className="mt-4">
            <div className="space-y-0.5">
              {sellOrders.map((order, index) => (
                <OrderRow
                  key={`sell-full-${index}`}
                  order={order}
                  type="sell"
                  maxTotal={maxSellTotal}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface OrderRowProps {
  order: {
    price: number;
    amount: number;
    total: number;
    count: number;
  };
  type: 'buy' | 'sell';
  maxTotal: number;
}

const OrderRow: React.FC<OrderRowProps> = ({ order, type, maxTotal }) => {
  const percentage = maxTotal > 0 ? (order.total / maxTotal) * 100 : 0;

  return (
    <div className="relative flex items-center justify-between py-1 px-2 text-sm hover:bg-accent/50 cursor-pointer">
      {/* Background bar */}
      <div
        className={cn(
          'absolute right-0 top-0 bottom-0 opacity-20',
          type === 'buy' ? 'bg-green-500' : 'bg-red-500'
        )}
        style={{ width: `${percentage}%` }}
      />

      {/* Content */}
      <span
        className={cn(
          'relative z-10 font-medium',
          type === 'buy' ? 'text-green-500' : 'text-red-500'
        )}
      >
        {formatPrice(order.price)}
      </span>
      <span className="relative z-10">{formatNumber(order.amount, 4)}</span>
      <span className="relative z-10 text-muted-foreground">
        {formatNumber(order.total, 2)}
      </span>
    </div>
  );
};

export default OrderBook;
