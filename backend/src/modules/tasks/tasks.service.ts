import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    leadId?: string;
    userId: string;
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    aiGenerated?: boolean;
  }) {
    return this.prisma.task.create({
      data: {
        leadId: dto.leadId,
        userId: dto.userId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority || 'medium',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        aiGenerated: dto.aiGenerated || false,
      },
      include: { lead: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async findMyTasks(userId: string, params: { status?: string; priority?: string; page?: number; limit?: number }) {
    const { status, priority, page = 1, limit = 20 } = params;
    const where: any = { userId };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
        include: { lead: { select: { id: true, firstName: true, lastName: true, email: true } } },
      }),
      this.prisma.task.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async update(id: string, dto: Partial<{ title: string; description: string; status: string; priority: string; dueDate: string }>) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    const data: any = { ...dto };
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    if (dto.status === 'completed' && !task.completedAt) data.completedAt = new Date();

    return this.prisma.task.update({ where: { id }, data });
  }

  async complete(id: string) {
    return this.prisma.task.update({
      where: { id },
      data: { status: 'completed', completedAt: new Date() },
    });
  }

  async remove(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }
}
