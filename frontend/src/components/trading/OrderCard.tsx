import React from 'react';
import { User, Star, Clock, Wallet, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatPrice, formatUSDT, formatINR } from '@/utils/formatters';
import { cn, getInitials } from '@/utils/helpers';
import type { Order } from '@/types';

interface OrderCardProps {
  order: Order;
  onTrade?: (order: Order) => void;
  showActions?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onTrade,
  showActions = true,
}) => {
  const isBuy = order.type === 'buy';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={order.user?.avatar} />
              <AvatarFallback>
                {order.user
                  ? getInitials(`${order.user.firstName} ${order.user.lastName}`)
                  : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {order.user?.firstName} {order.user?.lastName}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {order.user?.tradesCompleted || 0} trades
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {order.user?.rating || 0}%
                </span>
              </div>
            </div>
          </div>
          <Badge
            variant={isBuy ? 'success' : 'destructive'}
            className={cn(
              isBuy
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
            )}
          >
            {isBuy ? 'Buy' : 'Sell'}
          </Badge>
        </div>

        {/* Price and Amount */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-lg font-bold">{formatPrice(order.price)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-lg font-bold">{formatUSDT(order.remainingAmount)}</p>
          </div>
        </div>

        {/* Limits */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>Limits: {formatINR(order.minAmount)} - {formatINR(order.maxAmount)}</span>
        </div>

        {/* Payment Methods */}
        <div className="flex flex-wrap gap-2 mb-4">
          {order.paymentMethods.map((method) => (
            <Badge key={method} variant="secondary" className="text-xs">
              {method.toUpperCase()}
            </Badge>
          ))}
        </div>

        {/* Terms */}
        {order.terms && (
          <div className="mb-4 p-2 bg-muted rounded text-sm">
            <p className="line-clamp-2">{order.terms}</p>
          </div>
        )}

        {/* Actions */}
        {showActions && onTrade && (
          <Button
            className={cn(
              'w-full',
              isBuy
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            )}
            onClick={() => onTrade(order)}
          >
            {isBuy ? 'Sell USDT' : 'Buy USDT'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;
