import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SubtasksService } from './subtasks.service';
import { CreateSubtaskDto, UpdateSubtaskDto } from './dto/create-subtask.dto';

@ApiTags('Subtasks')
@Controller()
export class SubtasksController {
  constructor(private readonly subtasksService: SubtasksService) {}

  @Get('tasks/:taskId/subtasks')
  @ApiOperation({ summary: 'List subtasks of a task' })
  @ApiParam({ name: 'taskId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Subtasks retrieved successfully' })
  findByParentId(@Param('taskId', ParseUUIDPipe) taskId: string) {
    return this.subtasksService.findByParentId(taskId);
  }

  @Post('tasks/:taskId/subtasks')
  @ApiOperation({ summary: 'Create a subtask for a task' })
  @ApiParam({ name: 'taskId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Subtask created successfully' })
  create(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() createSubtaskDto: CreateSubtaskDto,
  ) {
    return this.subtasksService.create(taskId, createSubtaskDto);
  }

  @Patch('subtasks/:id')
  @ApiOperation({ summary: 'Update a subtask' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Subtask updated successfully' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubtaskDto: UpdateSubtaskDto,
  ) {
    return this.subtasksService.update(id, updateSubtaskDto);
  }

  @Delete('subtasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a subtask' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Subtask deleted successfully' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.subtasksService.delete(id);
  }

  @Patch('subtasks/:id/complete')
  @ApiOperation({ summary: 'Toggle subtask complete (DONE ↔ TODO)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Subtask completion toggled' })
  toggleComplete(@Param('id', ParseUUIDPipe) id: string) {
    return this.subtasksService.toggleComplete(id);
  }
}
