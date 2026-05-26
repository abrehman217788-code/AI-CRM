import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    leadId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    linkedinUrl?: string;
    role?: string;
    isPrimary?: boolean;
  }) {
    if (dto.isPrimary) {
      await this.prisma.contact.updateMany({
        where: { leadId: dto.leadId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return this.prisma.contact.create({ data: dto });
  }

  async findByLead(leadId: string) {
    return this.prisma.contact.findMany({
      where: { leadId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async update(id: string, dto: Partial<{ firstName: string; lastName: string; email: string; phone: string; jobTitle: string; linkedinUrl: string; role: string; isPrimary: boolean }>) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException('Contact not found');

    if (dto.isPrimary) {
      await this.prisma.contact.updateMany({
        where: { leadId: contact.leadId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return this.prisma.contact.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.contact.delete({ where: { id } });
  }
}
