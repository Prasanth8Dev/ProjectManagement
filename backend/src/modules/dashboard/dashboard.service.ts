import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getStats(userId?: string) {
    return this.dashboardRepository.getStats(userId);
  }

  async getCharts(userId?: string) {
    return this.dashboardRepository.getCharts(userId);
  }

  async getTodayTasks(userId?: string) {
    return this.dashboardRepository.getTodayTasks(userId);
  }

  async getUpcomingDeadlines(userId?: string) {
    return this.dashboardRepository.getUpcomingDeadlines(userId);
  }

  async getRecentActivity() {
    return this.dashboardRepository.getRecentActivity(20);
  }
}
