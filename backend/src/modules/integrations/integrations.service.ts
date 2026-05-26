import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IntegrationProvider } from '@prisma/client';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(private prisma: PrismaService) {}

  async getIntegrations() {
    return this.prisma.integration.findMany({ orderBy: { provider: 'asc' } });
  }

  async connect(provider: IntegrationProvider, config: Record<string, any>) {
    const existing = await this.prisma.integration.findFirst({ where: { provider } });

    if (existing) {
      return this.prisma.integration.update({
        where: { id: existing.id },
        data: { config, isActive: true },
      });
    }

    return this.prisma.integration.create({
      data: {
        provider,
        name: provider.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        config,
        isActive: true,
      },
    });
  }

  async disconnect(provider: IntegrationProvider) {
    const integration = await this.prisma.integration.findFirst({ where: { provider } });
    if (integration) {
      return this.prisma.integration.update({
        where: { id: integration.id },
        data: { isActive: false },
      });
    }
    return null;
  }

  async sync(provider: IntegrationProvider) {
    const integration = await this.prisma.integration.findFirst({ where: { provider } });
    if (!integration || !integration.isActive) {
      throw new Error(`Integration ${provider} is not active`);
    }

    this.logger.log(`Syncing ${provider} integration`);

    await this.prisma.integration.update({
      where: { id: integration.id },
      data: { lastSyncAt: new Date() },
    });

    return { provider, synced: true, timestamp: new Date() };
  }

  getAvailableProviders() {
    return Object.values(IntegrationProvider).map(provider => ({
      id: provider,
      name: provider.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      connected: false,
      category: this.getProviderCategory(provider),
    }));
  }

  private getProviderCategory(provider: IntegrationProvider): string {
    const crmProviders: IntegrationProvider[] = ['SALESFORCE', 'HUBSPOT', 'ZOHO'];
    const commProviders: IntegrationProvider[] = ['SLACK', 'MICROSOFT_TEAMS', 'GMAIL', 'OUTLOOK'];
    const marketingProviders: IntegrationProvider[] = ['LINKEDIN', 'META', 'GOOGLE_ADS'];
    const dataProviders: IntegrationProvider[] = ['CLEARBIT', 'APOLLO', 'ZOOMINFO'];

    if (crmProviders.includes(provider)) return 'CRM';
    if (commProviders.includes(provider)) return 'Communication';
    if (marketingProviders.includes(provider)) return 'Marketing';
    if (dataProviders.includes(provider)) return 'Data Provider';
    return 'Other';
  }
}
