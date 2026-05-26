import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async getLeadInsights(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        company: true,
        activities: { orderBy: { createdAt: 'desc' }, take: 20 },
        leadScores: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!lead) return null;

    const engagementScore = this.calculateEngagementScore(lead);
    const nextBestAction = this.suggestNextAction(lead);
    const intentSignal = this.detectIntent(lead);

    return {
      conversionProbability: lead.aiScore || 50,
      engagementScore,
      intentSignal,
      nextBestAction,
      suggestedActions: this.generateSuggestedActions(lead),
      insights: this.generateInsights(lead),
    };
  }

  async getRecommendations(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        assignedLeads: {
          where: { status: { notIn: ['ARCHIVED', 'CONVERTED', 'DISQUALIFIED'] } },
          orderBy: { score: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) return null;

    return {
      priorityLeads: user.assignedLeads.map(lead => ({
        id: lead.id,
        name: `${lead.firstName} ${lead.lastName}`,
        score: lead.score,
        aiScore: lead.aiScore,
        suggestedAction: this.suggestNextAction(lead),
      })),
      summary: {
        totalActive: user.assignedLeads.length,
        avgScore: user.assignedLeads.reduce((acc, l) => acc + l.score, 0) / (user.assignedLeads.length || 1),
        highPriority: user.assignedLeads.filter(l => l.score >= 70).length,
      },
    };
  }

  async suggestEmailContent(leadId: string, context?: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { company: true },
    });

    if (!lead) return null;

    const templates = this.getEmailTemplates(lead, context);
    return templates;
  }

  async predictLeadScore(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { activities: true, company: true },
    });

    if (!lead) return null;

    const features = {
      hasEmail: !!lead.email,
      hasPhone: !!lead.phone,
      hasJobTitle: !!lead.jobTitle,
      hasCompany: !!lead.companyId,
      activityCount: lead.activities?.length || 0,
      emailEngagement: lead.activities?.filter(a => a.type === 'EMAIL').length || 0,
      companySize: lead.company?.employeeCount || 0,
      daysSinceCreation: Math.floor((Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
    };

    let probability = 30;
    if (features.hasEmail) probability += 10;
    if (features.hasJobTitle) probability += 10;
    if (features.hasCompany) probability += 10;
    if (features.companySize > 50) probability += 10;
    if (features.emailEngagement > 2) probability += 15;
    if (features.activityCount > 5) probability += 10;
    if (features.daysSinceCreation < 7) probability += 5;

    return {
      leadId,
      probability: Math.min(probability, 98),
      confidence: Math.min(40 + features.activityCount * 5, 90),
      features,
      recommendation: probability >= 70 ? 'HIGH_PRIORITY' : probability >= 40 ? 'MEDIUM_PRIORITY' : 'NURTURE',
    };
  }

  private calculateEngagementScore(lead: any): number {
    if (!lead.activities || lead.activities.length === 0) return 0;
    let score = 0;
    for (const activity of lead.activities) {
      if (activity.type === 'EMAIL') score += 10;
      if (activity.type === 'CALL') score += 15;
      if (activity.type === 'MEETING') score += 25;
    }
    return Math.min(score, 100);
  }

  private suggestNextAction(lead: any): string {
    if (!lead.lastContactedAt) return 'Send first outreach email';
    const daysSinceContact = Math.floor((Date.now() - new Date(lead.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceContact > 7) return 'Re-engage with follow-up';
    if (lead.score >= 70) return 'Schedule discovery call';
    if (lead.score >= 40) return 'Send personalized content';
    return 'Continue nurturing';
  }

  private detectIntent(lead: any): { level: string; signals: string[] } {
    const signals: string[] = [];
    const activities = lead.activities || [];

    if (activities.some((a: any) => a.type === 'EMAIL' && a.subject?.toLowerCase().includes('meeting'))) {
      signals.push('Requested meeting');
    }
    if (activities.length > 5) signals.push('High engagement');
    if (lead.company?.employeeCount && lead.company.employeeCount > 100) signals.push('Enterprise prospect');

    return {
      level: signals.length >= 2 ? 'HIGH' : signals.length === 1 ? 'MEDIUM' : 'LOW',
      signals,
    };
  }

  private generateSuggestedActions(lead: any): string[] {
    const actions: string[] = [];
    if (!lead.lastContactedAt) actions.push('Send initial outreach email');
    if (!lead.companyId) actions.push('Enrich company data');
    if (!lead.phone) actions.push('Find phone number');
    if (lead.score >= 70) actions.push('Create opportunity');
    if (lead.activities && lead.activities.length === 0) actions.push('Log first activity');
    return actions;
  }

  private generateInsights(lead: any): string[] {
    const insights: string[] = [];
    if (lead.score > 70) insights.push('High-value lead — prioritize immediately');
    if (lead.company?.industry) insights.push(`Target industry: ${lead.company.industry}`);
    if (lead.activities && lead.activities.length > 10) insights.push('Highly engaged prospect');
    return insights;
  }

  private getEmailTemplates(lead: any, context?: string): { subject: string; body: string }[] {
    const name = lead.firstName;
    const company = lead.company?.name || 'your company';
    return [
      {
        subject: `Quick question, ${name}`,
        body: `Hi ${name},\n\nI noticed ${company} is doing great things in the industry. I'd love to connect and see if our platform can help you generate more leads.\n\nWould you have 15 minutes this week?\n\nBest,\n[Your Name]`,
      },
      {
        subject: `Idea for ${company}`,
        body: `Hi ${name},\n\nI have an idea that could help ${company} increase lead conversion by 30%.\n\nWould you be open to a quick call?\n\nBest,\n[Your Name]`,
      },
    ];
  }
}
