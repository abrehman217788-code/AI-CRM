import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ScoringService } from './scoring.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Scoring')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('scoring')
export class ScoringController {
  constructor(private scoringService: ScoringService) {}

  @Post('calculate/:leadId')
  @ApiOperation({ summary: 'Calculate score for a lead' })
  calculate(@Param('leadId') leadId: string) {
    return this.scoringService.calculateLeadScore(leadId);
  }

  @Get('rules')
  @ApiOperation({ summary: 'Get all scoring rules' })
  getRules() {
    return this.scoringService.getRules();
  }

  @Post('rules')
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER)
  @ApiOperation({ summary: 'Create a scoring rule' })
  createRule(@Body() dto: { name: string; field: string; operator: string; value: string; points: number }) {
    return this.scoringService.createRule(dto);
  }

  @Put('rules/:id')
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER)
  @ApiOperation({ summary: 'Update a scoring rule' })
  updateRule(@Param('id') id: string, @Body() dto: any) {
    return this.scoringService.updateRule(id, dto);
  }

  @Delete('rules/:id')
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER)
  @ApiOperation({ summary: 'Delete a scoring rule' })
  deleteRule(@Param('id') id: string) {
    return this.scoringService.deleteRule(id);
  }
}
