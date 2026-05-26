import { Zap, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { Workflow } from '@/types';

interface WorkflowCardProps {
  workflow: Workflow;
}

const triggerColors: Record<string, string> = {
  LEAD_CREATED: 'bg-blue-100 text-blue-700',
  LEAD_UPDATED: 'bg-indigo-100 text-indigo-700',
  LEAD_STAGE_CHANGED: 'bg-purple-100 text-purple-700',
  OPPORTUNITY_CREATED: 'bg-emerald-100 text-emerald-700',
  TASK_COMPLETED: 'bg-amber-100 text-amber-700',
  EMAIL_OPENED: 'bg-rose-100 text-rose-700',
};

export function WorkflowCard({ workflow }: WorkflowCardProps) {
  const actions = Array.isArray(workflow.actions) ? workflow.actions : workflow.actions ? [workflow.actions] : [];

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold text-surface-900">{workflow.name}</h3>
        </div>
        <Badge variant={workflow.isActive ? 'success' : 'neutral'}>
          {workflow.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {workflow.description && <p className="text-xs text-surface-500 mb-3">{workflow.description}</p>}

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-3 w-3 text-surface-400" />
          <span className={`text-xs px-2 py-0.5 rounded ${triggerColors[workflow.triggerType] || 'bg-surface-100 text-surface-600'}`}>
            {workflow.triggerType.replace(/_/g, ' ')}
          </span>
        </div>
        {actions.length > 0 && (
          <div className="text-xs text-surface-500 space-y-0.5">
            {actions.map((a: any, i: number) => (
              <span key={i} className="block">→ {a.type?.replace(/_/g, ' ')}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-surface-400 pt-3 border-t border-surface-100">
        <span>Run {workflow.runCount} times</span>
        <span>{workflow.lastRunAt ? formatDate(workflow.lastRunAt, 'relative') : 'Never run'}</span>
      </div>
    </div>
  );
}
