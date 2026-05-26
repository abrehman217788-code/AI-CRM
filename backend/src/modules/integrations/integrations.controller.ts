import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IntegrationsService } from './integrations.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { IntegrationProvider, UserRole } from '@prisma/client';

@ApiTags('Integrations')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('integrations')
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all integrations' })
  getIntegrations() {
    return this.integrationsService.getIntegrations();
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available integration providers' })
  getAvailable() {
    return this.integrationsService.getAvailableProviders();
  }

  @Post(':provider/connect')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Connect an integration' })
  connect(@Param('provider') provider: IntegrationProvider, @Body() config: any) {
    return this.integrationsService.connect(provider, config);
  }

  @Post(':provider/disconnect')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Disconnect an integration' })
  disconnect(@Param('provider') provider: IntegrationProvider) {
    return this.integrationsService.disconnect(provider);
  }

  @Post(':provider/sync')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Sync data from integration' })
  sync(@Param('provider') provider: IntegrationProvider) {
    return this.integrationsService.sync(provider);
  }
}
