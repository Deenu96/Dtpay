import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  className,
}) => {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center',
        className
      )}
    >
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
    </div>
  );
};

export default LoadingOverlay;
