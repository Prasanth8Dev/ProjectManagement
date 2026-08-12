import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto, AssignTaskDto, ChangeStatusDto } from './dto/task-filter.dto';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List all tasks with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  findAll(@Query() filterDto: TaskFilterDto) {
    return this.tasksService.findAll(filterDto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.tasksService.create(createTaskDto, actorUserId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID with subtasks, checklist, history' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task (tracks field changes in history)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.tasksService.update(id, updateTaskDto, actorUserId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.delete(id);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign task to a user' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Task assigned successfully' })
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDto: AssignTaskDto,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.tasksService.assign(id, assignDto, actorUserId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change task status (records history + activity)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Status changed successfully' })
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: ChangeStatusDto,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.tasksService.changeStatus(id, statusDto, actorUserId);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get task change history' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'History retrieved successfully' })
  getHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.getHistory(id);
  }

  @Get(':id/activity')
  @ApiOperation({ summary: 'Get activity feed for a task' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Activity retrieved successfully' })
  getActivity(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.getActivity(id);
  }
}
