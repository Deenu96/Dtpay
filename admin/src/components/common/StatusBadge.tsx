import React from 'react';
import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS, STATUS_LABELS } from '@/utils/constants';
import { cn } from '@/utils/helpers';

type StatusType = keyof typeof STATUS_COLORS;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS.pending;
  const label = STATUS_LABELS[status] || status;

  return (
    <Badge
      variant="outline"
      className={cn('status-badge', colorClass, className)}
    >
      {label}
    </Badge>
  );
};

export default StatusBadge;
