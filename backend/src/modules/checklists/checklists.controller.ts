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
import { ChecklistsService } from './checklists.service';
import {
  CreateChecklistItemDto,
  UpdateChecklistItemDto,
  ReorderChecklistDto,
} from './dto/checklist.dto';

@ApiTags('Checklists')
@Controller()
export class ChecklistsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Get('tasks/:taskId/checklist')
  @ApiOperation({ summary: 'Get all checklist items for a task' })
  @ApiParam({ name: 'taskId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Checklist retrieved successfully' })
  findByTaskId(@Param('taskId', ParseUUIDPipe) taskId: string) {
    return this.checklistsService.findByTaskId(taskId);
  }

  @Post('tasks/:taskId/checklist')
  @ApiOperation({ summary: 'Add a checklist item to a task' })
  @ApiParam({ name: 'taskId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Checklist item created successfully' })
  create(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() createDto: CreateChecklistItemDto,
  ) {
    return this.checklistsService.create(taskId, createDto);
  }

  @Patch('checklist/:id')
  @ApiOperation({ summary: 'Update a checklist item' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Checklist item updated successfully' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateChecklistItemDto,
  ) {
    return this.checklistsService.update(id, updateDto);
  }

  @Delete('checklist/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a checklist item' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Checklist item deleted successfully' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.checklistsService.delete(id);
  }

  @Patch('tasks/:taskId/checklist/reorder')
  @ApiOperation({ summary: 'Reorder checklist items' })
  @ApiParam({ name: 'taskId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Checklist reordered successfully' })
  reorder(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() reorderDto: ReorderChecklistDto,
  ) {
    return this.checklistsService.reorder(taskId, reorderDto);
  }
}
