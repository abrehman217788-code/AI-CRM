import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'No data found',
  description = 'There are no items to display.',
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="rounded-full bg-surface-100 p-3 mb-4">
        <Icon className="h-6 w-6 text-surface-400" />
      </div>
      <h3 className="font-medium text-surface-900">{title}</h3>
      <p className="mt-1 text-sm text-surface-500 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
