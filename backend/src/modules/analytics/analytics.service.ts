import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LeadStatus, OpportunityStage, ActivityType } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const totalLeads = await this.prisma.lead.count();
    const newLeads = await this.prisma.lead.count({ where: { status: LeadStatus.NEW } });
    const mqls = await this.prisma.lead.count({ where: { status: LeadStatus.MQL } });
    const sqls = await this.prisma.lead.count({ where: { status: LeadStatus.SQL } });
    const opportunities = await this.prisma.opportunity.count();
    const wonOpportunities = await this.prisma.opportunity.count({ where: { stage: OpportunityStage.CLOSED_WON } });

    const pipelineValue = await this.prisma.opportunity.aggregate({
      _sum: { value: true },
      where: { stage: { notIn: [OpportunityStage.CLOSED_WON, OpportunityStage.CLOSED_LOST] } },
    });

    const wonValue = await this.prisma.opportunity.aggregate({
      _sum: { value: true },
      where: { stage: OpportunityStage.CLOSED_WON },
    });

    const leadConversionRate = totalLeads > 0 ? (opportunities / totalLeads) * 100 : 0;
    const winRate = opportunities > 0 ? (wonOpportunities / opportunities) * 100 : 0;

    return {
      totalLeads,
      newLeads,
      mqls,
      sqls,
      opportunities,
      wonOpportunities,
      pipelineValue: pipelineValue._sum.value || 0,
      wonValue: wonValue._sum.value || 0,
      leadConversionRate: Math.round(leadConversionRate * 100) / 100,
      winRate: Math.round(winRate * 100) / 100,
    };
  }

  async getConversionFunnel() {
    const stages = [
      { name: 'Visitors', query: {} },
      { name: 'Leads', query: { status: LeadStatus.NEW } },
      { name: 'MQLs', query: { status: LeadStatus.MQL } },
      { name: 'SQLs', query: { status: LeadStatus.SQL } },
      { name: 'Opportunities', query: { status: LeadStatus.OPPORTUNITY } },
      { name: 'Closed Won', query: { status: LeadStatus.CONVERTED } },
    ];

    const funnel = [];
    for (const stage of stages) {
      let count: number;
      if (stage.name === 'Visitors') {
        count = await this.prisma.activity.count({
          where: { type: ActivityType.NOTE },
        });
      } else {
        count = await this.prisma.lead.count({ where: stage.query as any });
      }
      funnel.push({ name: stage.name, count });
    }

    return funnel;
  }

  async getRepPerformance() {
    const users = await this.prisma.user.findMany({
      where: { isActive: true, role: { in: ['SDR', 'AE', 'SALES_MANAGER'] } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        _count: { select: { assignedLeads: true, activities: true, assignedOpportunities: true } },
      },
    });

    return users.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      role: u.role,
      leadsAssigned: u._count.assignedLeads,
      activities: u._count.activities,
      opportunities: u._count.assignedOpportunities,
    }));
  }

  async getLeadSourceRoi() {
    const sources = await this.prisma.lead.groupBy({
      by: ['source'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return Promise.all(
      sources.map(async (s) => {
        const opportunities = await this.prisma.opportunity.count({
          where: { lead: { source: s.source } },
        });
        const wonValue = await this.prisma.opportunity.aggregate({
          _sum: { value: true },
          where: { stage: OpportunityStage.CLOSED_WON, lead: { source: s.source } },
        });

        return {
          source: s.source,
          leads: s._count.id,
          opportunities,
          wonValue: wonValue._sum.value || 0,
          conversionRate: s._count.id > 0 ? (opportunities / s._count.id) * 100 : 0,
        };
      }),
    );
  }

  async getPipelineTrends(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const opportunities = await this.prisma.opportunity.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
    });

    const trends: Record<string, { created: number; value: number; won: number }> = {};
    for (const opp of opportunities) {
      const dateKey = opp.createdAt.toISOString().split('T')[0];
      if (!trends[dateKey]) trends[dateKey] = { created: 0, value: 0, won: 0 };
      trends[dateKey].created++;
      trends[dateKey].value += Number(opp.value);
      if (opp.stage === OpportunityStage.CLOSED_WON) trends[dateKey].won++;
    }

    return Object.entries(trends).map(([date, data]) => ({ date, ...data }));
  }

  async getKpis() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const leadsThisMonth = await this.prisma.lead.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    const oppsThisMonth = await this.prisma.opportunity.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    const wonThisMonth = await this.prisma.opportunity.count({
      where: { stage: OpportunityStage.CLOSED_WON, updatedAt: { gte: startOfMonth } },
    });

    const responseTime = await this.getAvgResponseTime();

    return {
      leadVelocity: leadsThisMonth,
      sqlConversionRate: leadsThisMonth > 0 ? (oppsThisMonth / leadsThisMonth) * 100 : 0,
      winRate: oppsThisMonth > 0 ? (wonThisMonth / oppsThisMonth) * 100 : 0,
      avgResponseTimeHours: responseTime,
    };
  }

  private async getAvgResponseTime(): Promise<number> {
    const activities = await this.prisma.activity.findMany({
      where: { type: ActivityType.EMAIL, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      select: { leadId: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    if (activities.length === 0) return 0;

    const responseTimes: number[] = [];
    const leadFirstActivity: Record<string, Date> = {};

    for (const act of activities) {
      if (!leadFirstActivity[act.leadId]) {
        leadFirstActivity[act.leadId] = act.createdAt;
      } else {
        const diff = (act.createdAt.getTime() - leadFirstActivity[act.leadId].getTime()) / (1000 * 60 * 60);
        responseTimes.push(diff);
      }
    }

    return responseTimes.length > 0
      ? Math.round((responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) * 100) / 100
      : 0;
  }
}
