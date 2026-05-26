import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LeadsService } from './leads.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LeadStatus, LeadSource, UserRole } from '@prisma/client';

@ApiTags('Leads')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SDR)
  @ApiOperation({ summary: 'Create a new lead' })
  create(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.leadsService.create({ ...dto, createdById: userId });
  }

  @Get()
  @ApiOperation({ summary: 'Get all leads with pagination and filters' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', enum: LeadStatus, required: false })
  @ApiQuery({ name: 'source', enum: LeadSource, required: false })
  @ApiQuery({ name: 'ownerId', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query() query: any) {
    return this.leadsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by ID' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SDR, UserRole.AE)
  @ApiOperation({ summary: 'Update a lead' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.leadsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER)
  @ApiOperation({ summary: 'Delete a lead' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }

  @Post('bulk-update')
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER)
  @ApiOperation({ summary: 'Bulk update leads' })
  bulkUpdate(@Body() dto: { ids: string[]; data: any }) {
    return this.leadsService.bulkUpdate(dto.ids, dto.data);
  }
}
