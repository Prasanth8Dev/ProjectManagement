import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { ActivityFilterDto } from './dto/activity-filter.dto';

@ApiTags('Activity')
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: 'Get global activity feed with filtering' })
  @ApiResponse({ status: 200, description: 'Activity feed retrieved successfully' })
  findAll(@Query() filterDto: ActivityFilterDto) {
    return this.activityService.findAll(filterDto);
  }
}
