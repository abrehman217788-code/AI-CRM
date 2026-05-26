import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  suffix?: string;
}

export function StatsCard({ label, value, icon: Icon, color = 'text-blue-600 bg-blue-100', suffix }: StatsCardProps) {
  return (
    <div className="card">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn('rounded-lg p-2.5', color)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-surface-500">{label}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-xl font-bold text-surface-900">{value}</p>
            {suffix && <span className="text-xs text-surface-400">{suffix}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
