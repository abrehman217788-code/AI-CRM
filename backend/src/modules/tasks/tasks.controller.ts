import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a task' })
  create(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.tasksService.create({ ...dto, userId });
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my tasks with filters' })
  findMy(@CurrentUser('id') userId: string, @Query() query: any) {
    return this.tasksService.findMyTasks(userId, query);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.tasksService.update(id, dto);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Mark task as completed' })
  complete(@Param('id') id: string) {
    return this.tasksService.complete(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
