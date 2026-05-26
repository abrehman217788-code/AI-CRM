import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Lead, User, UserRole } from '@prisma/client';

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);

  constructor(private prisma: PrismaService) {}

  async assignLead(leadId: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return null;
    if (lead.ownerId) return lead;

    const assignee = await this.findBestAssignee(lead);
    if (!assignee) return lead;

    const updated = await this.prisma.lead.update({
      where: { id: leadId },
      data: { ownerId: assignee.id },
      include: { owner: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });

    await this.prisma.activity.create({
      data: {
        leadId,
        userId: assignee.id,
        type: 'SYSTEM',
        subject: 'Lead auto-assigned',
        description: `Lead assigned to ${assignee.firstName} ${assignee.lastName} via routing rules`,
      },
    });

    return updated;
  }

  async getRoutingStats() {
    const unassigned = await this.prisma.lead.count({ where: { ownerId: null, status: { not: 'ARCHIVED' } } });
    const assignedToday = await this.prisma.lead.count({
      where: {
        ownerId: { not: null },
        updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });
    const slaBreached = await this.prisma.lead.count({
      where: {
        ownerId: null,
        status: 'NEW',
        createdAt: { lt: new Date(Date.now() - 30 * 60 * 1000) },
      },
    });

    return { unassigned, assignedToday, slaBreached };
  }

  private async findBestAssignee(lead: Lead): Promise<User | null> {
    const sdrUsers = await this.prisma.user.findMany({
      where: { role: UserRole.SDR, isActive: true },
      include: { _count: { select: { assignedLeads: true } } },
      orderBy: { assignedLeads: { _count: 'asc' } },
    });

    if (sdrUsers.length === 0) return null;

    if (lead.score >= 70) {
      const aEs = await this.prisma.user.findMany({
        where: { role: UserRole.AE, isActive: true },
        include: { _count: { select: { assignedLeads: true } } },
        orderBy: { assignedLeads: { _count: 'asc' } },
      });
      if (aEs.length > 0) return aEs[0];
    }

    return sdrUsers[0];
  }
}
