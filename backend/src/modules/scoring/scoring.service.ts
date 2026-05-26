import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(private prisma: PrismaService) {}

  async calculateLeadScore(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { company: true, activities: true, leadScores: true },
    });

    if (!lead) return null;

    const rules = await this.prisma.scoringRule.findMany({ where: { isActive: true } });
    let totalScore = 0;
    const scoreEntries: { factor: string; score: number; reason: string }[] = [];

    for (const rule of rules) {
      const value = this.getFieldValue(lead, rule.field);
      if (value !== null && this.evaluateRule(value, rule.operator, rule.value)) {
        totalScore += rule.points;
        scoreEntries.push({ factor: rule.name, score: rule.points, reason: `${rule.field} ${rule.operator} ${rule.value}` });
      }
    }

    const aiScore = await this.calculateAiScore(lead);

    await this.prisma.leadScore.createMany({
      data: scoreEntries.map(s => ({
        leadId,
        score: s.score,
        factor: s.factor,
        reason: s.reason,
        aiScore: aiScore.score,
        confidence: aiScore.confidence,
      })),
    });

    const finalScore = Math.round(totalScore * 0.6 + aiScore.score * 0.4);

    await this.prisma.lead.update({
      where: { id: leadId },
      data: { score: finalScore, aiScore: aiScore.score },
    });

    return { score: finalScore, aiScore: aiScore.score, confidence: aiScore.confidence, factors: scoreEntries };
  }

  async getRules() {
    return this.prisma.scoringRule.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createRule(dto: { name: string; field: string; operator: string; value: string; points: number }) {
    return this.prisma.scoringRule.create({ data: dto });
  }

  async updateRule(id: string, dto: Partial<{ name: string; field: string; operator: string; value: string; points: number; isActive: boolean }>) {
    return this.prisma.scoringRule.update({ where: { id }, data: dto });
  }

  async deleteRule(id: string) {
    return this.prisma.scoringRule.delete({ where: { id } });
  }

  private async calculateAiScore(lead: any): Promise<{ score: number; confidence: number }> {
    const activityCount = lead.activities?.length || 0;
    const emailEngagement = lead.activities?.filter((a: any) => a.type === 'EMAIL').length || 0;
    const hasCompanyInfo = !!lead.companyId;
    const hasJobTitle = !!lead.jobTitle;

    let score = 25;
    if (hasCompanyInfo) score += 20;
    if (hasJobTitle) score += 15;
    if (emailEngagement > 0) score += Math.min(emailEngagement * 5, 20);
    if (activityCount > 5) score += 10;
    if (lead.company?.employeeCount && lead.company.employeeCount > 50) score += 10;

    const confidence = Math.min((activityCount > 0 ? 30 : 0) + (hasCompanyInfo ? 25 : 0) + (hasJobTitle ? 20 : 0) + (emailEngagement > 0 ? 25 : 0), 95);

    return { score: Math.min(score, 100), confidence };
  }

  private getFieldValue(lead: any, field: string): any {
    const parts = field.split('.');
    let value = lead;
    for (const part of parts) {
      if (value == null) return null;
      value = value[part];
    }
    return value;
  }

  private evaluateRule(value: any, operator: string, ruleValue: string): boolean {
    switch (operator) {
      case 'eq': return String(value).toLowerCase() === ruleValue.toLowerCase();
      case 'neq': return String(value).toLowerCase() !== ruleValue.toLowerCase();
      case 'gt': return Number(value) > Number(ruleValue);
      case 'gte': return Number(value) >= Number(ruleValue);
      case 'lt': return Number(value) < Number(ruleValue);
      case 'lte': return Number(value) <= Number(ruleValue);
      case 'contains': return String(value).toLowerCase().includes(ruleValue.toLowerCase());
      case 'in': return ruleValue.split(',').map(s => s.trim().toLowerCase()).includes(String(value).toLowerCase());
      default: return false;
    }
  }
}
