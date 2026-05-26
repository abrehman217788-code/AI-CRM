'use client';

import { useQuery } from '@tanstack/react-query';
import { leadService } from '@/services/lead.service';
import { BarChart3, Users, Target, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const { data: stats } = useQuery({ queryKey: ['dashboard'], queryFn: () => leadService.getDashboard() });
  const { data: funnel } = useQuery({ queryKey: ['funnel'], queryFn: () => leadService.getFunnel() });
  const { data: pipeline } = useQuery({ queryKey: ['pipeline-summary'], queryFn: () => leadService.getPipelineSummary() });
  const { data: trends } = useQuery({ queryKey: ['trends'], queryFn: () => leadService.getPipelineTrends() });

  const cards = [
    { label: 'Total Leads', value: stats?.totalLeads || 0, icon: Users, color: 'text-blue-600 bg-blue-100' },
    { label: 'MQLs', value: stats?.mqls || 0, icon: Target, color: 'text-amber-600 bg-amber-100' },
    { label: 'SQLs', value: stats?.sqls || 0, icon: TrendingUp, color: 'text-purple-600 bg-purple-100' },
    { label: 'Opportunities', value: stats?.opportunities || 0, icon: Activity, color: 'text-indigo-600 bg-indigo-100' },
    { label: 'Pipeline Value', value: `$${Number(stats?.pipelineValue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-100' },
    { label: 'Win Rate', value: `${stats?.winRate || 0}%`, icon: BarChart3, color: 'text-rose-600 bg-rose-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
        <p className="text-surface-500 mt-1">Overview of your sales pipeline and lead generation</p>
      </div>

      <div className="grid grid-cols-6 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2.5 ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-500">{card.label}</p>
                  <p className="text-xl font-bold text-surface-900">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-surface-900 mb-4">Conversion Funnel</h3>
          <div className="space-y-3">
            {funnel?.map((stage, i) => (
              <div key={stage.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-600">{stage.name}</span>
                  <span className="font-semibold">{stage.count}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-100">
                  <div
                    className="h-2 rounded-full bg-primary-500 transition-all"
                    style={{ width: `${funnel[0]?.count > 0 ? (stage.count / funnel[0].count) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-surface-900 mb-4">Pipeline by Stage</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pipeline?.stages.filter(s => s.value > 0).map(s => ({ name: s.stage.replace(/_/g, ' '), value: Number(s.value) })) || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {(pipeline?.stages.filter(s => s.value > 0) || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 justify-center">
            {pipeline?.stages.filter(s => s.value > 0).map((s, i) => (
              <span key={s.stage} className="text-xs flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {s.stage.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
