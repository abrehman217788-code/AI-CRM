import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnrichmentService {
  private readonly logger = new Logger(EnrichmentService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async enrichLead(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { company: true },
    });

    if (!lead) return null;

    const enrichment: Record<string, any> = {};

    if (lead.email) {
      const domain = lead.email.split('@')[1];
      if (domain && !lead.companyId) {
        const company = await this.enrichCompany(domain);
        if (company) {
          enrichment.companyId = company.id;
        }
      }
    }

    if (lead.jobTitle) {
      const industry = this.inferIndustryFromTitle(lead.jobTitle);
      if (enrichment.customFields) {
        enrichment.customFields = { ...enrichment.customFields, inferredIndustry: industry };
      } else {
        enrichment.customFields = { inferredIndustry: industry };
      }
    }

    if (Object.keys(enrichment).length > 0) {
      await this.prisma.lead.update({
        where: { id: leadId },
        data: enrichment,
      });
    }

    return { enriched: true, fields: Object.keys(enrichment) };
  }

  async enrichCompany(domain: string) {
    let company = await this.prisma.company.findFirst({
      where: { domain: { contains: domain, mode: 'insensitive' } },
    });

    if (!company) {
      company = await this.prisma.company.create({
        data: {
          name: domain.split('.')[0],
          domain,
          industry: this.inferIndustryFromDomain(domain),
        },
      });
    }

    return company;
  }

  async verifyEmail(email: string): Promise<{ valid: boolean; score: number }> {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return { valid: false, score: 0 };

    const domain = email.split('@')[1];
    const disposableDomains = ['tempmail.com', 'throwaway.com', 'mailinator.com'];
    if (disposableDomains.includes(domain)) return { valid: false, score: 0 };

    return { valid: true, score: 85 };
  }

  private inferIndustryFromTitle(title: string): string {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('engineer') || titleLower.includes('developer') || titleLower.includes('tech')) return 'Technology';
    if (titleLower.includes('market') || titleLower.includes('sales') || titleLower.includes('growth')) return 'Marketing';
    if (titleLower.includes('financ') || titleLower.includes('account') || titleLower.includes('audit')) return 'Finance';
    if (titleLower.includes('health') || titleLower.includes('medic') || titleLower.includes('clin')) return 'Healthcare';
    if (titleLower.includes('recruit') || titleLower.includes('hr') || titleLower.includes('talent')) return 'Recruitment';
    return 'Unknown';
  }

  private inferIndustryFromDomain(domain: string): string {
    const d = domain.toLowerCase();
    if (d.includes('tech') || d.includes('soft') || d.includes('code') || d.includes('data')) return 'Technology';
    if (d.includes('fin') || d.includes('bank') || d.includes('invest')) return 'Finance';
    if (d.includes('health') || d.includes('med') || d.includes('care')) return 'Healthcare';
    if (d.includes('market') || d.includes('ad') || d.includes('media')) return 'Marketing';
    if (d.includes('recruit') || d.includes('hr') || d.includes('job')) return 'Recruitment';
    return 'Unknown';
  }
}
