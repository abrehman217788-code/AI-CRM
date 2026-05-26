'use client';

import { useQuery } from '@tanstack/react-query';
import { leadService } from '@/services/lead.service';
import { getStageColor } from '@/lib/utils';
import { Plus } from 'lucide-react';

const STAGES = ['PROSPECTING', 'QUALIFICATION', 'NEED_ANALYSIS', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];

export default function PipelinePage() {
  const { data: pipeline } = useQuery({
    queryKey: ['pipeline-summary'],
    queryFn: () => leadService.getPipelineSummary(),
  });

  const { data: opps } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => leadService.getAll({ limit: 100 }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Pipeline</h1>
          <p className="text-surface-500 mt-1">Track deals through each stage of the sales process</p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" /> Add Deal
        </button>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {STAGES.map((stage) => {
          const stageData = pipeline?.stages.find(s => s.stage === stage);
          return (
            <div key={stage} className="bg-surface-100 rounded-lg p-3">
              <div className={`text-xs font-semibold px-2 py-1 rounded ${getStageColor(stage)} inline-block mb-2`}>
                {stage.replace(/_/g, ' ')}
              </div>
              <p className="text-lg font-bold text-surface-900">{stageData?.count || 0}</p>
              <p className="text-xs text-surface-500">${Number(stageData?.value || 0).toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h3 className="font-semibold text-surface-900 mb-4">All Deals</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200">
              <th className="text-left px-3 py-2 text-xs font-medium text-surface-500 uppercase">Deal Name</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-surface-500 uppercase">Value</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-surface-500 uppercase">Stage</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-surface-500 uppercase">Probability</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-surface-500 uppercase">Owner</th>
            </tr>
          </thead>
          <tbody>
            {opps?.data?.filter((l: any) => l.opportunities?.length > 0).flatMap((l: any) =>
              l.opportunities?.map((opp: any) => (
                <tr key={opp.id} className="border-b border-surface-100">
                  <td className="px-3 py-3 text-sm font-medium">{opp.name}</td>
                  <td className="px-3 py-3 text-sm">${Number(opp.value).toLocaleString()}</td>
                  <td className="px-3 py-3"><span className={`text-xs px-2 py-0.5 rounded ${getStageColor(opp.stage)}`}>{opp.stage.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-3 text-sm">{opp.probability}%</td>
                  <td className="px-3 py-3 text-sm text-surface-500">{opp.owner ? `${opp.owner.firstName} ${opp.owner.lastName}` : 'Unassigned'}</td>
                </tr>
              ))
            ) || (
              <tr><td colSpan={5} className="text-center py-8 text-surface-400">No deals found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
