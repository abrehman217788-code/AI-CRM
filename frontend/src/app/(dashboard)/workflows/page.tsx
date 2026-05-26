'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Workflow, Plus, Play, Pause, Activity, Zap } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function WorkflowsPage() {
  const { data } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => api.get('/workflows').then(r => r.data),
  });

  const triggerColors: Record<string, string> = {
    LEAD_CREATED: 'bg-blue-100 text-blue-700',
    LEAD_UPDATED: 'bg-indigo-100 text-indigo-700',
    LEAD_STAGE_CHANGED: 'bg-purple-100 text-purple-700',
    OPPORTUNITY_CREATED: 'bg-emerald-100 text-emerald-700',
    TASK_COMPLETED: 'bg-amber-100 text-amber-700',
    EMAIL_OPENED: 'bg-rose-100 text-rose-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Workflows</h1>
          <p className="text-surface-500 mt-1">Automate sales processes with no-code workflows</p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" /> Create Workflow
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {data?.data?.map((wf: any) => (
          <div key={wf.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-surface-900">{wf.name}</h3>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${wf.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-100 text-surface-500'}`}>
                {wf.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {wf.description && <p className="text-xs text-surface-500 mb-3">{wf.description}</p>}

            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-surface-400" />
                <span className={`text-xs px-2 py-0.5 rounded ${triggerColors[wf.triggerType] || 'bg-surface-100 text-surface-600'}`}>
                  {wf.triggerType.replace(/_/g, ' ')}
                </span>
              </div>
              {wf.actions && typeof wf.actions === 'object' && (
                <div className="text-xs text-surface-500">
                  {(Array.isArray(wf.actions) ? wf.actions : [wf.actions]).map((a: any, i: number) => (
                    <span key={i} className="block">→ {a.type?.replace(/_/g, ' ')}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-surface-400 pt-3 border-t border-surface-100">
              <span>Run {wf.runCount} times</span>
              <span>{wf.lastRunAt ? formatDate(wf.lastRunAt, 'relative') : 'Never run'}</span>
            </div>
          </div>
        ))}
        {(!data?.data || data.data.length === 0) && (
          <div className="col-span-3 text-center py-12 text-surface-400">No workflows created yet</div>
        )}
      </div>
    </div>
  );
}
