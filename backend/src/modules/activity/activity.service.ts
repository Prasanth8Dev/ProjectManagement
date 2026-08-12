import { Injectable } from '@nestjs/common';
import { ActivityRepository, LogActivityData } from './activity.repository';
import { ActivityFilterDto } from './dto/activity-filter.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class ActivityService {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async logActivity(data: LogActivityData) {
    try {
      return await this.activityRepository.logActivity(data);
    } catch (error) {
      // Don't throw — activity logging should never break main flow
      console.error('Failed to log activity:', error);
    }
  }

  async findAll(filterDto: ActivityFilterDto) {
    const {
      page = 1,
      limit = 20,
      userId,
      projectId,
      taskId,
      action,
      dateFrom,
      dateTo,
      sortOrder,
    } = filterDto;

    const { activity, total } = await this.activityRepository.findAll({
      page,
      limit,
      userId,
      projectId,
      taskId,
      action,
      dateFrom,
      dateTo,
      sortOrder,
    });

    return createPaginatedResponse(activity, total, page, limit);
  }

  async findRecent(limit: number = 20) {
    return this.activityRepository.findRecent(limit);
  }
}
