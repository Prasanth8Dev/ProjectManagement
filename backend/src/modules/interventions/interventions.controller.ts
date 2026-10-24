import { Controller, Get, Post, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InterventionsService } from './interventions.service';
import { CreateInterventionDto } from './dto/intervention.dto';

@ApiTags('Interventions')
@Controller()
export class InterventionsController {
  constructor(private readonly interventionsService: InterventionsService) {}

  @Get('tasks/:taskId/interventions')
  @ApiOperation({ summary: 'List interventions logged on a task' })
  @ApiParam({ name: 'taskId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Interventions retrieved successfully' })
  findByTaskId(@Param('taskId', ParseUUIDPipe) taskId: string) {
    return this.interventionsService.findByTaskId(taskId);
  }

  @Post('tasks/:taskId/interventions')
  @ApiOperation({ summary: 'Log a manual intervention on a task' })
  @ApiParam({ name: 'taskId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Intervention logged successfully' })
  createForTask(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() createDto: CreateInterventionDto,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.interventionsService.createForTask(taskId, createDto, actorUserId);
  }

  @Get('bugs/:bugId/interventions')
  @ApiOperation({ summary: 'List interventions logged on a bug' })
  @ApiParam({ name: 'bugId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Interventions retrieved successfully' })
  findByBugId(@Param('bugId', ParseUUIDPipe) bugId: string) {
    return this.interventionsService.findByBugId(bugId);
  }

  @Post('bugs/:bugId/interventions')
  @ApiOperation({ summary: 'Log a manual intervention on a bug' })
  @ApiParam({ name: 'bugId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Intervention logged successfully' })
  createForBug(
    @Param('bugId', ParseUUIDPipe) bugId: string,
    @Body() createDto: CreateInterventionDto,
    @Query('actorUserId') actorUserId?: string,
  ) {
    return this.interventionsService.createForBug(bugId, createDto, actorUserId);
  }

  @Get('employees/:employeeId/interventions')
  @ApiOperation({ summary: 'List all interventions logged about an employee' })
  @ApiParam({ name: 'employeeId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Interventions retrieved successfully' })
  findByEmployeeId(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.interventionsService.findByEmployeeId(employeeId);
  }
}
