import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    name: string;
    domain?: string;
    industry?: string;
    employeeCount?: number;
    revenue?: string;
    description?: string;
    city?: string;
    state?: string;
    country?: string;
    linkedinUrl?: string;
  }) {
    return this.prisma.company.create({ data: dto });
  }

  async findAll(params: { page?: number; limit?: number; search?: string; industry?: string }) {
    const { page = 1, limit = 20, search, industry } = params;
    const where: any = {};
    if (industry) where.industry = industry;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: { _count: { select: { leads: true, opportunities: true } } },
      }),
      this.prisma.company.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        _count: { select: { leads: true, opportunities: true } },
        leads: { take: 10, orderBy: { createdAt: 'desc' }, include: { owner: { select: { id: true, firstName: true, lastName: true } } } },
      },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(id: string, dto: Partial<{
    name: string;
    domain: string;
    industry: string;
    employeeCount: number;
    revenue: string;
    description: string;
    logoUrl: string;
    linkedinUrl: string;
    city: string;
    state: string;
    country: string;
    technologies: any;
  }>) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.company.delete({ where: { id } });
  }
}
