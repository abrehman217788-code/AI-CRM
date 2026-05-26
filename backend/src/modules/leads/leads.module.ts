import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { ScoringModule } from '../scoring/scoring.module';
import { RoutingModule } from '../routing/routing.module';
import { EnrichmentModule } from '../enrichment/enrichment.module';

@Module({
  imports: [ScoringModule, RoutingModule, EnrichmentModule],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
