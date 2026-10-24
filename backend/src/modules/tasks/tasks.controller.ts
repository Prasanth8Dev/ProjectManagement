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
import {
  PauseTaskDto,
  BlockTaskDto,
  CompleteTaskDto,
  SendForReviewDto,
  CompleteReviewDto,
  CloseTaskDto,
} from './dto/task-control.dto';

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
  @ApiOperation({ summary: 'Get task change/lifecycle event history' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'History retrieved successfully' })
  getHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.getHistory(id);
  }

  @Get(':id/time-tracking')
  @ApiOperation({ summary: 'Get computed time-tracking metrics for a task' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Time tracking retrieved successfully' })
  getTimeTracking(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.getTimeTracking(id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start work on a task' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  startTask(@Param('id', ParseUUIDPipe) id: string, @Query('actorUserId') actorUserId?: string) {
    return this.tasksService.startTask(id, actorUserId);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause an in-progress task' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  pauseTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PauseTaskDto,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.tasksService.pauseTask(id, dto, actorUserId);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume a paused task' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  resumeTask(@Param('id', ParseUUIDPipe) id: string, @Query('actorUserId') actorUserId?: string) {
    return this.tasksService.resumeTask(id, actorUserId);
  }

  @Post(':id/block')
  @ApiOperation({ summary: 'Mark a task as blocked' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  blockTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BlockTaskDto,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.tasksService.blockTask(id, dto, actorUserId);
  }

  @Post(':id/unblock')
  @ApiOperation({ summary: 'Unblock a task' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  unblockTask(@Param('id', ParseUUIDPipe) id: string, @Query('actorUserId') actorUserId?: string) {
    return this.tasksService.unblockTask(id, actorUserId);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark a task as completed' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  completeTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteTaskDto,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.tasksService.completeTask(id, dto, actorUserId);
  }

  @Post(':id/send-for-review')
  @ApiOperation({ summary: 'Send a task for review/QA' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  sendForReview(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendForReviewDto,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.tasksService.sendForReview(id, dto, actorUserId);
  }

  @Post(':id/complete-review')
  @ApiOperation({ summary: 'Mark review as complete' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  completeReview(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteReviewDto,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.tasksService.completeReview(id, dto, actorUserId);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close a completed task' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  closeTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CloseTaskDto,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.tasksService.closeTask(id, dto, actorUserId);
  }

  @Get(':id/activity')
  @ApiOperation({ summary: 'Get activity feed for a task' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Activity retrieved successfully' })
  getActivity(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.getActivity(id);
  }
}
