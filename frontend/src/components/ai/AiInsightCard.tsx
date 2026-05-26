import { Brain, Target, Lightbulb, TrendingUp } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface AiInsightCardProps {
  conversionProbability?: number;
  engagementScore?: number;
  intentSignal?: { level: string; signals: string[] };
  nextBestAction?: string;
  insights?: string[];
}

export function AiInsightCard({
  conversionProbability,
  engagementScore,
  intentSignal,
  nextBestAction,
  insights,
}: AiInsightCardProps) {
  if (!conversionProbability && !nextBestAction) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-primary-500" />
          <CardTitle>AI Insights</CardTitle>
        </div>
        <p className="text-sm text-surface-400">No AI insights available for this lead yet.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-primary-500" />
        <CardTitle>AI Insights</CardTitle>
      </div>
      <div className="space-y-3">
        {conversionProbability !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-600">Conversion Probability</span>
            <span className="text-sm font-semibold">{Math.round(conversionProbability)}%</span>
          </div>
        )}
        {engagementScore !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-600">Engagement Score</span>
            <span className="text-sm font-semibold">{Math.round(engagementScore)}%</span>
          </div>
        )}
        {intentSignal && (
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-500" />
            <span className="text-sm"><strong>Intent:</strong> {intentSignal.level}</span>
          </div>
        )}
        {nextBestAction && (
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-primary-500 mt-0.5" />
            <span className="text-sm"><strong>Next action:</strong> {nextBestAction}</span>
          </div>
        )}
        {insights?.map((insight, i) => (
          <p key={i} className="text-sm text-surface-600 pl-6">• {insight}</p>
        ))}
      </div>
    </Card>
  );
}
