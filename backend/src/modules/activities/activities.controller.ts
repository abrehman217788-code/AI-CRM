import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ActivitiesService } from './activities.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Activities')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('activities')
export class ActivitiesController {
  constructor(private activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create activity for a lead' })
  create(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.activitiesService.create({ ...dto, userId });
  }

  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Get activities for a lead' })
  findByLead(@Param('leadId') leadId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.activitiesService.findByLead(leadId, page, limit);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an activity' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.activitiesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an activity' })
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }
}
