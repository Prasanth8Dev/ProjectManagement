import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PerformanceService } from './performance.service';

@ApiTags('Performance')
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get()
  @ApiOperation({ summary: 'Employee performance summary (all active employees)' })
  @ApiResponse({ status: 200, description: 'Performance summary retrieved successfully' })
  getSummary() {
    return this.performanceService.getSummary();
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Detailed performance breakdown for one employee' })
  @ApiParam({ name: 'userId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Performance detail retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getDetail(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.performanceService.getDetail(userId);
  }
}
