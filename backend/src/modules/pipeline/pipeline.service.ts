import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OpportunityStage } from '@prisma/client';

@Injectable()
export class PipelineService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    leadId: string;
    name: string;
    value?: number;
    stage?: OpportunityStage;
    ownerId?: string;
    companyId?: string;
    forecastDate?: string;
  }) {
    return this.prisma.opportunity.create({
      data: {
        leadId: dto.leadId,
        name: dto.name,
        value: dto.value || 0,
        stage: dto.stage || OpportunityStage.PROSPECTING,
        ownerId: dto.ownerId,
        companyId: dto.companyId,
        forecastDate: dto.forecastDate ? new Date(dto.forecastDate) : null,
      },
      include: {
        lead: { select: { id: true, firstName: true, lastName: true, email: true } },
        owner: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async findAll(params: { page?: number; limit?: number; stage?: OpportunityStage; ownerId?: string }) {
    const { page = 1, limit = 20, stage, ownerId } = params;
    const where: any = {};
    if (stage) where.stage = stage;
    if (ownerId) where.ownerId = ownerId;

    const [data, total] = await Promise.all([
      this.prisma.opportunity.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          lead: { select: { id: true, firstName: true, lastName: true, email: true } },
          company: true,
          owner: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.opportunity.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const opp = await this.prisma.opportunity.findUnique({
      where: { id },
      include: {
        lead: { include: { company: true } },
        company: true,
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!opp) throw new NotFoundException('Opportunity not found');
    return opp;
  }

  async updateStage(id: string, stage: OpportunityStage) {
    const opp = await this.prisma.opportunity.findUnique({ where: { id } });
    if (!opp) throw new NotFoundException('Opportunity not found');

    return this.prisma.opportunity.update({
      where: { id },
      data: {
        stage,
        ...(stage === OpportunityStage.CLOSED_WON || stage === OpportunityStage.CLOSED_LOST ? { closeDate: new Date() } : {}),
      },
      include: {
        lead: { select: { id: true, firstName: true, lastName: true } },
        owner: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, dto: Partial<{ name: string; value: number; stage: OpportunityStage; probability: number; forecastDate: string; notes: string }>) {
    const opp = await this.prisma.opportunity.findUnique({ where: { id } });
    if (!opp) throw new NotFoundException('Opportunity not found');

    const data: any = { ...dto };
    if (dto.forecastDate) data.forecastDate = new Date(dto.forecastDate);

    return this.prisma.opportunity.update({ where: { id }, data });
  }

  async getPipelineSummary() {
    const stages = Object.values(OpportunityStage);
    const summary = [];

    for (const stage of stages) {
      const count = await this.prisma.opportunity.count({ where: { stage } });
      const aggregate = await this.prisma.opportunity.aggregate({
        where: { stage },
        _sum: { value: true },
      });
      summary.push({ stage, count, value: aggregate._sum.value || 0 });
    }

    const totalValue = summary.reduce((acc, s) => acc + Number(s.value), 0);
    const wonValue = summary.find(s => s.stage === OpportunityStage.CLOSED_WON)?.value || 0;

    return {
      stages: summary,
      totalValue,
      wonValue,
      forecastValue: summary
        .filter(s => s.stage !== OpportunityStage.CLOSED_WON && s.stage !== OpportunityStage.CLOSED_LOST)
        .reduce((acc, s) => acc + Number(s.value), 0),
      winRate: totalValue > 0 ? (Number(wonValue) / Number(totalValue)) * 100 : 0,
    };
  }
}
