import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoutingService } from './routing.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Routing')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('routing')
export class RoutingController {
  constructor(private routingService: RoutingService) {}

  @Post('assign/:leadId')
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER)
  @ApiOperation({ summary: 'Auto-assign lead to best available rep' })
  assignLead(@Param('leadId') leadId: string) {
    return this.routingService.assignLead(leadId);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER)
  @ApiOperation({ summary: 'Get routing stats' })
  getStats() {
    return this.routingService.getRoutingStats();
  }
}
