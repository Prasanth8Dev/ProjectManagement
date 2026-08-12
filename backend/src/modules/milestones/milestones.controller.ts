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
import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto, UpdateMilestoneDto } from './dto/milestone.dto';

@ApiTags('Milestones')
@Controller()
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Get('projects/:projectId/milestones')
  @ApiOperation({ summary: 'List milestones for a project' })
  @ApiParam({ name: 'projectId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Milestones retrieved successfully' })
  findByProjectId(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.milestonesService.findByProjectId(projectId);
  }

  @Post('projects/:projectId/milestones')
  @ApiOperation({ summary: 'Create a milestone for a project' })
  @ApiParam({ name: 'projectId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Milestone created successfully' })
  create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createDto: CreateMilestoneDto,
  ) {
    return this.milestonesService.create(projectId, createDto);
  }

  @Get('milestones/:id')
  @ApiOperation({ summary: 'Get milestone by ID with task count' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Milestone retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.milestonesService.findById(id);
  }

  @Patch('milestones/:id')
  @ApiOperation({ summary: 'Update a milestone' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Milestone updated successfully' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateMilestoneDto,
  ) {
    return this.milestonesService.update(id, updateDto);
  }

  @Delete('milestones/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a milestone' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Milestone deleted successfully' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.milestonesService.delete(id);
  }
}
