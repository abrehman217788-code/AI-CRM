import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { LeadsModule } from './modules/leads/leads.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { EnrichmentModule } from './modules/enrichment/enrichment.module';
import { RoutingModule } from './modules/routing/routing.module';
import { SequencesModule } from './modules/sequences/sequences.module';
import { PipelineModule } from './modules/pipeline/pipeline.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { AiModule } from './modules/ai/ai.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UploadsModule } from './modules/uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    LeadsModule,
    CompaniesModule,
    ContactsModule,
    ScoringModule,
    EnrichmentModule,
    RoutingModule,
    SequencesModule,
    PipelineModule,
    AnalyticsModule,
    WorkflowsModule,
    AiModule,
    ChatbotModule,
    ActivitiesModule,
    TasksModule,
    CampaignsModule,
    IntegrationsModule,
    NotificationsModule,
    UploadsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
