import { cn } from '@/lib/utils';

interface PriorityLeadCardProps {
  name: string;
  score: number;
  aiScore: number;
  suggestedAction: string;
  onClick?: () => void;
}

export function PriorityLeadCard({ name, score, aiScore, suggestedAction, onClick }: PriorityLeadCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3 rounded-lg border border-surface-200 hover:border-primary-200 transition-colors cursor-pointer"
    >
      <div>
        <p className="font-medium text-surface-900">{name}</p>
        <p className="text-xs text-surface-400">{suggestedAction}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn('text-sm font-semibold', aiScore >= 70 ? 'text-emerald-600' : aiScore >= 40 ? 'text-amber-600' : 'text-surface-400')}>
          {Math.round(aiScore)}%
        </span>
        <span className={cn('text-xs px-2 py-0.5 rounded-full', score >= 70 ? 'bg-emerald-100 text-emerald-700' : score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-surface-100 text-surface-500')}>
          Score: {score}
        </span>
      </div>
    </div>
  );
}
