import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PipelineService } from './pipeline.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { OpportunityStage, UserRole } from '@prisma/client';

@ApiTags('Pipeline')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('pipeline')
export class PipelineController {
  constructor(private pipelineService: PipelineService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.AE)
  @ApiOperation({ summary: 'Create an opportunity' })
  create(@Body() dto: any) {
    return this.pipelineService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all opportunities' })
  findAll(@Query() query: any) {
    return this.pipelineService.findAll(query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get pipeline summary with stage breakdown' })
  getSummary() {
    return this.pipelineService.getPipelineSummary();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get opportunity by ID' })
  findOne(@Param('id') id: string) {
    return this.pipelineService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.AE)
  @ApiOperation({ summary: 'Update opportunity' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.pipelineService.update(id, dto);
  }

  @Put(':id/stage')
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.AE)
  @ApiOperation({ summary: 'Update opportunity stage' })
  updateStage(@Param('id') id: string, @Body('stage') stage: OpportunityStage) {
    return this.pipelineService.updateStage(id, stage);
  }
}
