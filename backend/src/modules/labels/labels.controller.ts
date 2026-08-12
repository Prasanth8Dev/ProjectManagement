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
import { LabelsService } from './labels.service';
import { CreateLabelDto, UpdateLabelDto } from './dto/label.dto';

@ApiTags('Labels')
@Controller()
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Get('projects/:projectId/labels')
  @ApiOperation({ summary: 'List labels for a project' })
  @ApiParam({ name: 'projectId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Labels retrieved successfully' })
  findByProjectId(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.labelsService.findByProjectId(projectId);
  }

  @Post('projects/:projectId/labels')
  @ApiOperation({ summary: 'Create a label for a project' })
  @ApiParam({ name: 'projectId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Label created successfully' })
  create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createDto: CreateLabelDto,
  ) {
    return this.labelsService.create(projectId, createDto);
  }

  @Patch('labels/:id')
  @ApiOperation({ summary: 'Update a label' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Label updated successfully' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateLabelDto,
  ) {
    return this.labelsService.update(id, updateDto);
  }

  @Delete('labels/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a label' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Label deleted successfully' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.labelsService.delete(id);
  }

  @Post('tasks/:taskId/labels/:labelId')
  @ApiOperation({ summary: 'Attach a label to a task' })
  @ApiParam({ name: 'taskId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'labelId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Label attached to task' })
  attachToTask(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
  ) {
    return this.labelsService.attachToTask(taskId, labelId);
  }

  @Delete('tasks/:taskId/labels/:labelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Detach a label from a task' })
  @ApiParam({ name: 'taskId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'labelId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Label detached from task' })
  detachFromTask(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
  ) {
    return this.labelsService.detachFromTask(taskId, labelId);
  }
}
