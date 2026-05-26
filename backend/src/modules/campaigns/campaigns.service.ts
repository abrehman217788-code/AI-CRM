import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LeadSource, OpportunityStage } from '@prisma/client';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    name: string;
    description?: string;
    source: LeadSource;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    budget?: number;
    startDate?: string;
    endDate?: string;
  }) {
    return this.prisma.campaign.create({
      data: {
        name: dto.name,
        description: dto.description,
        source: dto.source,
        utmSource: dto.utmSource,
        utmMedium: dto.utmMedium,
        utmCampaign: dto.utmCampaign,
        budget: dto.budget || 0,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.campaign.count(),
    ]);

    const enriched = await Promise.all(
      data.map(async (campaign) => {
        const source = campaign.source;
        const leadsCount = await this.prisma.lead.count({
          where: { source },
        });
        const opportunitiesCount = await this.prisma.opportunity.count({
          where: { lead: { source } },
        });
        const wonValue = await this.prisma.opportunity.aggregate({
          _sum: { value: true },
          where: { stage: OpportunityStage.CLOSED_WON, lead: { source } },
        });

        return {
          ...campaign,
          leadsGenerated: leadsCount,
          conversions: opportunitiesCount,
          revenue: wonValue._sum.value || 0,
          roi: Number(campaign.spent) > 0 ? ((Number(wonValue._sum.value || 0) - Number(campaign.spent)) / Number(campaign.spent)) * 100 : 0,
        };
      }),
    );

    return { data: enriched, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const leadsCount = await this.prisma.lead.count({
      where: { source: campaign.source },
    });
    const opportunitiesCount = await this.prisma.opportunity.count({
      where: { lead: { source: campaign.source } },
    });
    const wonValue = await this.prisma.opportunity.aggregate({
      _sum: { value: true },
      where: { stage: OpportunityStage.CLOSED_WON, lead: { source: campaign.source } },
    });

    return {
      ...campaign,
      leadsGenerated: leadsCount,
      conversions: opportunitiesCount,
      revenue: wonValue._sum.value || 0,
    };
  }

  async update(id: string, dto: Partial<{
    name: string;
    description: string;
    budget: number;
    spent: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
  }>) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);

    return this.prisma.campaign.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.campaign.delete({ where: { id } });
  }
}
