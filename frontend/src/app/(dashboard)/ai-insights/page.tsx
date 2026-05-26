'use client';

import { useQuery } from '@tanstack/react-query';
import { leadService } from '@/services/lead.service';
import { Brain, Target, Lightbulb, TrendingUp, AlertCircle, Zap } from 'lucide-react';

export default function AiInsightsPage() {
  const { data: recommendations } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: () => leadService.getAiRecommendations(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">AI Insights</h1>
        <p className="text-surface-500 mt-1">AI-powered recommendations and lead intelligence</p>
      </div>

      {recommendations?.summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-5 w-5" />
              <p className="text-sm font-medium opacity-80">Active Leads</p>
            </div>
            <p className="text-3xl font-bold">{recommendations.summary.totalActive}</p>
          </div>
          <div className="card bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5" />
              <p className="text-sm font-medium opacity-80">Avg AI Score</p>
            </div>
            <p className="text-3xl font-bold">{Math.round(recommendations.summary.avgScore)}</p>
          </div>
          <div className="card bg-gradient-to-br from-rose-500 to-pink-600 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-5 w-5" />
              <p className="text-sm font-medium opacity-80">High Priority</p>
            </div>
            <p className="text-3xl font-bold">{recommendations.summary.highPriority}</p>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary-500" />
          Priority Leads
        </h3>
        {recommendations?.priorityLeads?.length ? (
          <div className="space-y-3">
            {recommendations.priorityLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg border border-surface-200 hover:border-primary-200 transition-colors">
                <div>
                  <p className="font-medium text-surface-900">{lead.name}</p>
                  <p className="text-xs text-surface-400">{lead.suggestedAction}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${lead.aiScore >= 70 ? 'text-emerald-600' : lead.aiScore >= 40 ? 'text-amber-600' : 'text-surface-400'}`}>
                    {Math.round(lead.aiScore)}%
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    lead.score >= 70 ? 'bg-emerald-100 text-emerald-700' : lead.score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-surface-100 text-surface-500'
                  }`}>
                    Score: {lead.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-surface-400 py-4">No priority leads found</p>
        )}
      </div>

      <div className="card bg-gradient-to-br from-primary-50 to-indigo-50 border-primary-200">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary-100 p-2">
            <Lightbulb className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900">AI Pro Tip</h3>
            <p className="text-sm text-surface-600 mt-1">
              Focus on leads with AI scores above 70 first. Our model predicts these have the highest conversion probability.
              Schedule a call or send personalized content to move them through the pipeline faster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
