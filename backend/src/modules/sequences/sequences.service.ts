import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SequenceStepType } from '@prisma/client';

@Injectable()
export class SequencesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    name: string;
    description?: string;
    ownerId?: string;
    steps?: { order: number; type: SequenceStepType; subject?: string; content?: string; delayDays: number }[];
  }) {
    const sequence = await this.prisma.sequence.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId: dto.ownerId,
        steps: dto.steps ? { create: dto.steps } : undefined,
      },
      include: { steps: { orderBy: { order: 'asc' } } },
    });

    return sequence;
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.sequence.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: { steps: { orderBy: { order: 'asc' } }, owner: { select: { id: true, firstName: true, lastName: true } } },
      }),
      this.prisma.sequence.count(),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const sequence = await this.prisma.sequence.findUnique({
      where: { id },
      include: { steps: { orderBy: { order: 'asc' } }, owner: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    if (!sequence) throw new NotFoundException('Sequence not found');
    return sequence;
  }

  async update(id: string, dto: Partial<{ name: string; description: string; isActive: boolean }>) {
    return this.prisma.sequence.update({ where: { id }, data: dto, include: { steps: { orderBy: { order: 'asc' } } } });
  }

  async remove(id: string) {
    return this.prisma.sequence.delete({ where: { id } });
  }

  async addStep(sequenceId: string, dto: { order: number; type: SequenceStepType; subject?: string; content?: string; delayDays: number }) {
    return this.prisma.sequenceStep.create({
      data: { sequenceId, ...dto },
    });
  }

  async updateStep(id: string, dto: Partial<{ order: number; type: SequenceStepType; subject: string; content: string; delayDays: number }>) {
    return this.prisma.sequenceStep.update({ where: { id }, data: dto });
  }

  async removeStep(id: string) {
    return this.prisma.sequenceStep.delete({ where: { id } });
  }
}
