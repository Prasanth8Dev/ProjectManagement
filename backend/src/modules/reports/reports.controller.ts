import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dto/report.dto';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('tasks')
  @ApiOperation({
    summary: 'Task completion report',
    description: 'Returns total, completed, pending, overdue task breakdown with optional filters',
  })
  @ApiResponse({ status: 200, description: 'Task completion report retrieved' })
  getTaskCompletionReport(@Query() filterDto: ReportFilterDto) {
    return this.reportsService.getTaskCompletionReport(filterDto);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'List all overdue tasks across projects' })
  @ApiResponse({ status: 200, description: 'Overdue tasks retrieved' })
  getOverdueTasks() {
    return this.reportsService.getOverdueTasks();
  }

  @Get('employee/:userId')
  @ApiOperation({ summary: 'Employee performance report: tasks and daily updates in date range' })
  @ApiParam({ name: 'userId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Employee report retrieved' })
  getEmployeeReport(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() filterDto: ReportFilterDto,
  ) {
    return this.reportsService.getEmployeeReport(userId, filterDto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Project health report: task breakdown, milestones, team activity' })
  @ApiParam({ name: 'projectId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Project report retrieved' })
  getProjectReport(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.reportsService.getProjectReport(projectId);
  }
}
