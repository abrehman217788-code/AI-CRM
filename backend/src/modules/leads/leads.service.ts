import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LeadStatus, LeadSource } from '@prisma/client';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    companyName?: string;
    source?: LeadSource;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    ownerId?: string;
    createdById?: string;
  }) {
    const duplicate = dto.email ? await this.findDuplicate(dto.email) : null;
    if (duplicate) {
      this.logger.warn(`Duplicate lead detected: ${dto.email}`);
    }

    const lead = await this.prisma.lead.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email?.toLowerCase(),
        phone: dto.phone,
        jobTitle: dto.jobTitle,
        source: dto.source || LeadSource.MANUAL,
        utmSource: dto.utmSource,
        utmMedium: dto.utmMedium,
        utmCampaign: dto.utmCampaign,
        ownerId: dto.ownerId,
        createdById: dto.createdById,
        status: LeadStatus.NEW,
      },
      include: { company: true, owner: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });

    return lead;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    status?: LeadStatus;
    source?: LeadSource;
    ownerId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page = 1, limit = 20, status, source, ownerId, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (source) where.source = source;
    if (ownerId) where.ownerId = ownerId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          company: true,
          owner: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { activities: true, tasks: true, opportunities: true } },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        company: true,
        contacts: true,
        owner: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        activities: { orderBy: { createdAt: 'desc' }, take: 50 },
        tasks: { orderBy: { createdAt: 'desc' } },
        opportunities: true,
        leadScores: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async update(id: string, dto: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    jobTitle: string;
    status: LeadStatus;
    score: number;
    ownerId: string;
    notes: string;
    companyId: string;
  }>) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    if (dto.email) dto.email = dto.email.toLowerCase();

    return this.prisma.lead.update({
      where: { id },
      data: dto,
      include: { company: true, owner: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  }

  async remove(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    return this.prisma.lead.delete({ where: { id } });
  }

  async bulkUpdate(ids: string[], dto: Partial<{ status: LeadStatus; ownerId: string; score: number }>) {
    return this.prisma.lead.updateMany({
      where: { id: { in: ids } },
      data: dto,
    });
  }

  private async findDuplicate(email: string) {
    return this.prisma.lead.findFirst({
      where: { email: email.toLowerCase() },
    });
  }
}
