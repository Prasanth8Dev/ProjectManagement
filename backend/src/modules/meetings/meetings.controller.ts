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
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto, UpdateMeetingDto, UpdateMomDto } from './dto/meeting.dto';
import { CreateActionItemDto, UpdateActionItemDto } from './dto/action-item.dto';

@ApiTags('Meetings')
@Controller()
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get('projects/:projectId/meetings')
  @ApiOperation({ summary: 'List meetings for a project' })
  @ApiParam({ name: 'projectId', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'type', required: false })
  findAllForProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('type') type?: string,
  ) {
    return this.meetingsService.findAllForProject(projectId, type);
  }

  @Post('projects/:projectId/meetings')
  @ApiOperation({ summary: 'Schedule a new meeting on a project' })
  @ApiParam({ name: 'projectId', type: 'string', format: 'uuid' })
  create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateMeetingDto,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.meetingsService.create(projectId, dto, actorUserId);
  }

  @Get('meetings/:id')
  @ApiOperation({ summary: 'Get a meeting with participants and action items' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 404, description: 'Meeting not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.meetingsService.findById(id);
  }

  @Patch('meetings/:id')
  @ApiOperation({ summary: 'Update meeting details (title, schedule, participants, ...)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMeetingDto,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.meetingsService.update(id, dto, actorUserId);
  }

  @Patch('meetings/:id/mom')
  @ApiOperation({ summary: 'Update the MOM (Minutes of Meeting) editor fields' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  updateMom(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMomDto,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.meetingsService.updateMom(id, dto, actorUserId);
  }

  @Delete('meetings/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a meeting' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  delete(@Param('id', ParseUUIDPipe) id: string, @Query('actorUserId') actorUserId?: string) {
    return this.meetingsService.delete(id, actorUserId);
  }

  @Post('meetings/:id/action-items')
  @ApiOperation({ summary: 'Add an action item to a meeting' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  createActionItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateActionItemDto,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.meetingsService.createActionItem(id, dto, actorUserId);
  }

  @Patch('meetings/:meetingId/action-items/:id')
  @ApiOperation({ summary: 'Update an action item' })
  @ApiParam({ name: 'meetingId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  updateActionItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActionItemDto,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.meetingsService.updateActionItem(id, dto, actorUserId);
  }

  @Delete('meetings/:meetingId/action-items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an action item' })
  @ApiParam({ name: 'meetingId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  deleteActionItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.meetingsService.deleteActionItem(id, actorUserId);
  }

  @Post('meetings/:meetingId/action-items/:id/convert-to-task')
  @ApiOperation({ summary: 'Convert an action item into a project task' })
  @ApiParam({ name: 'meetingId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  convertToTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.meetingsService.convertToTask(id, actorUserId);
  }
}
