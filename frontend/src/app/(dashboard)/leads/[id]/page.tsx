'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { leadService } from '@/services/lead.service';
import { formatDate, getScoreColor, getStatusColor } from '@/lib/utils';
import { Mail, Phone, Building2, Globe, Linkedin, Brain, Target, Clock, Plus } from 'lucide-react';

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadService.getById(id),
  });

  const { data: insights } = useQuery({
    queryKey: ['ai-insights', id],
    queryFn: () => leadService.getAiInsights(id),
    enabled: !!id,
  });

  if (isLoading) return <div className="text-center py-12 text-surface-400">Loading...</div>;
  if (!lead) return <div className="text-center py-12 text-surface-400">Lead not found</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xl font-bold">
            {lead.firstName[0]}{lead.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">{lead.firstName} {lead.lastName}</h1>
            <p className="text-surface-500">{lead.jobTitle || 'No title'}</p>
          </div>
        </div>
        <span className={getStatusColor(lead.status)}>{lead.status.replace(/_/g, ' ')}</span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="card space-y-4">
          <h3 className="font-semibold text-surface-900">Contact Info</h3>
          {lead.email && <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-surface-400" /><span>{lead.email}</span></div>}
          {lead.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-surface-400" /><span>{lead.phone}</span></div>}
          {lead.company?.name && <div className="flex items-center gap-2 text-sm"><Building2 className="h-4 w-4 text-surface-400" /><span>{lead.company.name}</span></div>}
          {lead.company?.domain && <div className="flex items-center gap-2 text-sm"><Globe className="h-4 w-4 text-surface-400" /><span>{lead.company.domain}</span></div>}
          {lead.linkedinUrl && <div className="flex items-center gap-2 text-sm"><Linkedin className="h-4 w-4 text-surface-400" /><span className="text-primary-600">LinkedIn Profile</span></div>}
          <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-surface-400" /><span>Created {formatDate(lead.createdAt, 'long')}</span></div>
        </div>

        <div className="card space-y-4">
          <h3 className="font-semibold text-surface-900">Scores</h3>
          <div className="flex items-center gap-3">
            <div className={`flex h-16 w-16 items-center justify-center rounded-xl border-2 text-lg font-bold ${getScoreColor(lead.score)}`}>
              {lead.score}
            </div>
            <div>
              <p className="text-sm font-medium text-surface-700">Manual Score</p>
              <p className="text-xs text-surface-400">Based on scoring rules</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex h-16 w-16 items-center justify-center rounded-xl border-2 text-lg font-bold ${getScoreColor(Math.round(lead.aiScore))}`}>
              {Math.round(lead.aiScore)}
            </div>
            <div>
              <p className="text-sm font-medium text-surface-700">AI Score</p>
              <p className="text-xs text-surface-400">Predictive conversion probability</p>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="font-semibold text-surface-900">AI Insights</h3>
          {insights ? (
            <>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary-500" />
                <span className="text-sm"><strong>Next action:</strong> {insights.nextBestAction}</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-amber-500" />
                <span className="text-sm"><strong>Intent:</strong> {insights.intentSignal.level}</span>
              </div>
              {insights.insights.map((i, idx) => (
                <p key={idx} className="text-sm text-surface-600">• {i}</p>
              ))}
            </>
          ) : (
            <p className="text-sm text-surface-400">No AI insights available</p>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-surface-900 mb-4">Activity History</h3>
        {lead.activities && lead.activities.length > 0 ? (
          <div className="space-y-3">
            {lead.activities.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-surface-100 last:border-0">
                <div className="h-8 w-8 rounded-full bg-surface-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-surface-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-surface-900">{activity.subject || activity.type}</p>
                  <p className="text-xs text-surface-400">{activity.description} • {formatDate(activity.createdAt, 'relative')}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-surface-400 py-4">No activities recorded yet</p>
        )}
      </div>
    </div>
  );
}
