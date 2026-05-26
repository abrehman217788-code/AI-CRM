import { cn } from '@/lib/utils';

interface PipelineStageCardProps {
  stage: string;
  count: number;
  value: number;
  color?: string;
}

const stageColors: Record<string, string> = {
  PROSPECTING: 'bg-surface-100 text-surface-600',
  QUALIFICATION: 'bg-blue-100 text-blue-700',
  NEED_ANALYSIS: 'bg-indigo-100 text-indigo-700',
  PROPOSAL: 'bg-amber-100 text-amber-700',
  NEGOTIATION: 'bg-orange-100 text-orange-700',
  CLOSED_WON: 'bg-emerald-100 text-emerald-700',
  CLOSED_LOST: 'bg-red-100 text-red-700',
};

export function PipelineStageCard({ stage, count, value }: PipelineStageCardProps) {
  return (
    <div className="bg-surface-100 rounded-lg p-3">
      <span className={cn('text-xs font-semibold px-2 py-1 rounded inline-block mb-2', stageColors[stage] || 'bg-surface-100 text-surface-600')}>
        {stage.replace(/_/g, ' ')}
      </span>
      <p className="text-lg font-bold text-surface-900">{count}</p>
      <p className="text-xs text-surface-500">${value.toLocaleString()}</p>
    </div>
  );
}
