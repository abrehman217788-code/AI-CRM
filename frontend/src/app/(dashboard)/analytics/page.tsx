'use client';

import { useQuery } from '@tanstack/react-query';
import { leadService } from '@/services/lead.service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

export default function AnalyticsPage() {
  const { data: stats } = useQuery({ queryKey: ['dashboard'], queryFn: () => leadService.getDashboard() });
  const { data: trends } = useQuery({ queryKey: ['trends'], queryFn: () => leadService.getPipelineTrends(30) });
  const { data: roi } = useQuery({ queryKey: ['roi'], queryFn: () => leadService.getLeadSourceRoi() });
  const { data: reps } = useQuery({ queryKey: ['reps'], queryFn: () => leadService.getRepPerformance() });
  const { data: kpis } = useQuery({ queryKey: ['kpis'], queryFn: () => leadService.getKpis() });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Analytics</h1>
        <p className="text-surface-500 mt-1">Deep dive into your sales performance metrics</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Lead Velocity', value: kpis?.leadVelocity || 0, suffix: 'this month' },
          { label: 'SQL Conv. Rate', value: `${(kpis?.sqlConversionRate || 0).toFixed(1)}%`, suffix: '' },
          { label: 'Win Rate', value: `${(kpis?.winRate || 0).toFixed(1)}%`, suffix: '' },
          { label: 'Response Time', value: `${kpis?.avgResponseTimeHours || 0}h`, suffix: 'avg' },
        ].map((kpi) => (
          <div key={kpi.label} className="card">
            <p className="text-xs font-medium text-surface-500 uppercase">{kpi.label}</p>
            <p className="text-2xl font-bold text-surface-900 mt-1">{kpi.value}</p>
            <p className="text-xs text-surface-400 mt-1">{kpi.suffix}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-surface-900 mb-4">Pipeline Trends (30 days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trends || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} name="Pipeline Value" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-surface-900 mb-4">Lead Source ROI</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roi || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="source" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="leads" fill="#6366f1" name="Leads" />
              <Bar dataKey="conversionRate" fill="#10b981" name="Conv. Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-surface-900 mb-4">Rep Performance</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200">
              <th className="text-left px-3 py-2 text-xs font-medium text-surface-500 uppercase">Name</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-surface-500 uppercase">Role</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-surface-500 uppercase">Leads</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-surface-500 uppercase">Activities</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-surface-500 uppercase">Opps</th>
            </tr>
          </thead>
          <tbody>
            {reps?.map((rep) => (
              <tr key={rep.id} className="border-b border-surface-100">
                <td className="px-3 py-3 text-sm font-medium">{rep.name}</td>
                <td className="px-3 py-3 text-sm text-surface-500">{rep.role.replace(/_/g, ' ')}</td>
                <td className="px-3 py-3 text-sm">{rep.leadsAssigned}</td>
                <td className="px-3 py-3 text-sm">{rep.activities}</td>
                <td className="px-3 py-3 text-sm">{rep.opportunities}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
