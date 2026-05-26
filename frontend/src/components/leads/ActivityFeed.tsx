'use client';

import { useQuery } from '@tanstack/react-query';
import { activityService } from '@/services/activity.service';
import { formatDate } from '@/lib/utils';
import { Mail, Phone, Calendar, MessageSquare, StickyNote, Activity as ActivityIcon } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  NOTE: StickyNote,
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  TASK: ActivityIcon,
  SMS: MessageSquare,
  LINKEDIN_MESSAGE: MessageSquare,
};

const typeColors: Record<string, string> = {
  NOTE: 'bg-blue-100 text-blue-600',
  CALL: 'bg-emerald-100 text-emerald-600',
  EMAIL: 'bg-purple-100 text-purple-600',
  MEETING: 'bg-amber-100 text-amber-600',
  TASK: 'bg-surface-100 text-surface-600',
  SMS: 'bg-rose-100 text-rose-600',
};

interface ActivityFeedProps {
  leadId: string;
}

export function ActivityFeed({ leadId }: ActivityFeedProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', leadId],
    queryFn: () => activityService.getByLead(leadId),
  });

  if (isLoading) return <div className="text-center py-8 text-surface-400">Loading...</div>;

  if (!activities?.length) {
    return <EmptyState title="No activities" description="No activities recorded for this lead yet." />;
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = typeIcons[activity.type] || ActivityIcon;
        return (
          <div key={activity.id} className="flex items-start gap-3 py-3 border-b border-surface-100 last:border-0">
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-full shrink-0', typeColors[activity.type] || 'bg-surface-100')}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-surface-900">{activity.subject || activity.type}</p>
                <span className="text-xs text-surface-400">{formatDate(activity.createdAt, 'relative')}</span>
              </div>
              {activity.description && (
                <p className="text-sm text-surface-500 mt-0.5">{activity.description}</p>
              )}
              {activity.user && (
                <p className="text-xs text-surface-400 mt-1">
                  by {activity.user.firstName} {activity.user.lastName}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
