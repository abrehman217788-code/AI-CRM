import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ActivityType } from '@prisma/client';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    leadId: string;
    userId?: string;
    type: ActivityType;
    subject?: string;
    description?: string;
    metadata?: any;
    duration?: number;
    dueDate?: string;
  }) {
    return this.prisma.activity.create({
      data: {
        leadId: dto.leadId,
        userId: dto.userId,
        type: dto.type,
        subject: dto.subject,
        description: dto.description,
        metadata: dto.metadata,
        duration: dto.duration,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async findByLead(leadId: string, page = 1, limit = 50) {
    const [data, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: { leadId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
      }),
      this.prisma.activity.count({ where: { leadId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async update(id: string, dto: Partial<{ subject: string; description: string; duration: number; completedAt: string }>) {
    const activity = await this.prisma.activity.findUnique({ where: { id } });
    if (!activity) throw new NotFoundException('Activity not found');

    const data: any = { ...dto };
    if (dto.completedAt) data.completedAt = new Date(dto.completedAt);

    return this.prisma.activity.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.activity.delete({ where: { id } });
  }
}
