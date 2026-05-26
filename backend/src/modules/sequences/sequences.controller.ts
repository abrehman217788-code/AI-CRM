import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SequencesService } from './sequences.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Sequences')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('sequences')
export class SequencesController {
  constructor(private sequencesService: SequencesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SDR)
  @ApiOperation({ summary: 'Create a new sequence' })
  create(@Body() dto: any) {
    return this.sequencesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sequences' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.sequencesService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sequence by ID' })
  findOne(@Param('id') id: string) {
    return this.sequencesService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER)
  @ApiOperation({ summary: 'Update sequence' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.sequencesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER)
  @ApiOperation({ summary: 'Delete sequence' })
  remove(@Param('id') id: string) {
    return this.sequencesService.remove(id);
  }

  @Post(':id/steps')
  @ApiOperation({ summary: 'Add step to sequence' })
  addStep(@Param('id') id: string, @Body() dto: any) {
    return this.sequencesService.addStep(id, dto);
  }

  @Put('steps/:stepId')
  @ApiOperation({ summary: 'Update sequence step' })
  updateStep(@Param('stepId') stepId: string, @Body() dto: any) {
    return this.sequencesService.updateStep(stepId, dto);
  }

  @Delete('steps/:stepId')
  @ApiOperation({ summary: 'Remove sequence step' })
  removeStep(@Param('stepId') stepId: string) {
    return this.sequencesService.removeStep(stepId);
  }
}
