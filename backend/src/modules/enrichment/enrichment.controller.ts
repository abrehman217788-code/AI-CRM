import { Controller, Post, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EnrichmentService } from './enrichment.service';

@ApiTags('Enrichment')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('enrichment')
export class EnrichmentController {
  constructor(private enrichmentService: EnrichmentService) {}

  @Post('lead/:leadId')
  @ApiOperation({ summary: 'Enrich a lead with company and profile data' })
  enrichLead(@Param('leadId') leadId: string) {
    return this.enrichmentService.enrichLead(leadId);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email address validity' })
  verifyEmail(@Query('email') email: string) {
    return this.enrichmentService.verifyEmail(email);
  }

  @Get('company/:domain')
  @ApiOperation({ summary: 'Enrich company data from domain' })
  enrichCompany(@Param('domain') domain: string) {
    return this.enrichmentService.enrichCompany(domain);
  }
}
