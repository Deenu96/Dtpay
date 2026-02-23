import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCurrentPrice } from '@/hooks/useOrders';
import { formatPrice, formatPercentage } from '@/utils/formatters';
import { cn } from '@/utils/helpers';

interface PriceTickerProps {
  showChange?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const PriceTicker: React.FC<PriceTickerProps> = ({ 
  showChange = true,
  size = 'md' 
}) => {
  const { data: priceData, isLoading } = useCurrentPrice();

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-24 rounded bg-muted" />
      </div>
    );
  }

  if (!priceData) {
    return null;
  }

  const isPositive = priceData.change24h >= 0;

  return (
    <div className="flex items-center gap-2">
      <span className={cn('font-semibold', sizeClasses[size])}>
        {formatPrice(priceData.price)}
      </span>
      
      {showChange && (
        <span
          className={cn(
            'flex items-center gap-1 text-sm font-medium',
            isPositive ? 'text-green-500' : 'text-red-500'
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {formatPercentage(priceData.change24h)}
        </span>
      )}
    </div>
  );
};

export default PriceTicker;
