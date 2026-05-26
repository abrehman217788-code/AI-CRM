import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { WorkflowsService } from './workflows.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Workflows')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('workflows')
export class WorkflowsController {
  constructor(private workflowsService: WorkflowsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER)
  @ApiOperation({ summary: 'Create a workflow automation' })
  create(@Body() dto: any) {
    return this.workflowsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workflows' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.workflowsService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow by ID' })
  findOne(@Param('id') id: string) {
    return this.workflowsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER)
  @ApiOperation({ summary: 'Update workflow' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.workflowsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER)
  @ApiOperation({ summary: 'Delete workflow' })
  remove(@Param('id') id: string) {
    return this.workflowsService.remove(id);
  }
}
