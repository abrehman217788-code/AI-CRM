import { cn } from '@/lib/utils';

interface LeadScoreDisplayProps {
  score: number;
  aiScore?: number;
  label?: string;
}

export function LeadScoreDisplay({ score, aiScore, label }: LeadScoreDisplayProps) {
  const getColor = (s: number) => {
    if (s >= 70) return 'text-emerald-600 border-emerald-300 bg-emerald-50';
    if (s >= 40) return 'text-amber-600 border-amber-300 bg-amber-50';
    return 'text-surface-500 border-surface-300 bg-surface-50';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-14 w-14 items-center justify-center rounded-xl border-2 text-lg font-bold', getColor(score))}>
          {score}
        </div>
        <div>
          <p className="text-sm font-medium text-surface-700">{label || 'Score'}</p>
          <p className="text-xs text-surface-400">Manual scoring</p>
        </div>
      </div>
      {aiScore !== undefined && (
        <div className="flex items-center gap-3">
          <div className={cn('flex h-14 w-14 items-center justify-center rounded-xl border-2 text-lg font-bold', getColor(Math.round(aiScore)))}>
            {Math.round(aiScore)}
          </div>
          <div>
            <p className="text-sm font-medium text-surface-700">AI Score</p>
            <p className="text-xs text-surface-400">Predictive conversion</p>
          </div>
        </div>
      )}
    </div>
  );
}
