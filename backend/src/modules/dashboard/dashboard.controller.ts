import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiQuery({ name: 'userId', required: false, description: 'Filter stats for a specific user (DEVELOPER role)' })
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description: 'Returns total projects, tasks, members, overdue tasks, and today\'s updates count',
  })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved' })
  getStats(@Query('userId') userId?: string) {
    return this.dashboardService.getStats(userId);
  }

  @Get('charts')
  @ApiQuery({ name: 'userId', required: false })
  @ApiOperation({
    summary: 'Get dashboard chart data',
    description: 'Returns task status distribution, weekly progress, and project completion percentages',
  })
  @ApiResponse({ status: 200, description: 'Chart data retrieved' })
  getCharts(@Query('userId') userId?: string) {
    return this.dashboardService.getCharts(userId);
  }

  @Get('today-tasks')
  @ApiQuery({ name: 'userId', required: false })
  @ApiOperation({ summary: 'Get tasks due today' })
  @ApiResponse({ status: 200, description: 'Today\'s tasks retrieved' })
  getTodayTasks(@Query('userId') userId?: string) {
    return this.dashboardService.getTodayTasks(userId);
  }

  @Get('upcoming-deadlines')
  @ApiQuery({ name: 'userId', required: false })
  @ApiOperation({ summary: 'Get tasks due in the next 7 days' })
  @ApiResponse({ status: 200, description: 'Upcoming deadlines retrieved' })
  getUpcomingDeadlines(@Query('userId') userId?: string) {
    return this.dashboardService.getUpcomingDeadlines(userId);
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get last 20 activity log items' })
  @ApiResponse({ status: 200, description: 'Recent activity retrieved' })
  getRecentActivity() {
    return this.dashboardService.getRecentActivity();
  }
}
