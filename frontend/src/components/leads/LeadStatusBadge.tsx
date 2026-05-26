import { Badge } from '@/components/ui/Badge';
import type { LeadStatus } from '@/types';

const statusVariants: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  NEW: 'neutral',
  CONTACTED: 'primary',
  QUALIFIED: 'success',
  MQL: 'warning',
  SQL: 'warning',
  OPPORTUNITY: 'primary',
  CONVERTED: 'success',
  DISQUALIFIED: 'danger',
  ARCHIVED: 'neutral',
};

export function LeadStatusBadge({ status }: { status: LeadStatus | string }) {
  return (
    <Badge variant={statusVariants[status] || 'neutral'}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
