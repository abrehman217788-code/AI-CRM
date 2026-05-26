import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard summary stats' })
  getDashboard() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('funnel')
  @ApiOperation({ summary: 'Get conversion funnel data' })
  getFunnel() {
    return this.analyticsService.getConversionFunnel();
  }

  @Get('rep-performance')
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER)
  @ApiOperation({ summary: 'Get rep performance metrics' })
  getRepPerformance() {
    return this.analyticsService.getRepPerformance();
  }

  @Get('lead-source-roi')
  @ApiOperation({ summary: 'Get ROI by lead source' })
  getLeadSourceRoi() {
    return this.analyticsService.getLeadSourceRoi();
  }

  @Get('pipeline-trends')
  @ApiOperation({ summary: 'Get pipeline trends over time' })
  @ApiQuery({ name: 'days', required: false })
  getPipelineTrends(@Query('days') days?: number) {
    return this.analyticsService.getPipelineTrends(days);
  }

  @Get('kpis')
  @ApiOperation({ summary: 'Get key performance indicators' })
  getKpis() {
    return this.analyticsService.getKpis();
  }
}
