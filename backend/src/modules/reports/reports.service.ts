import { Injectable } from '@nestjs/common';
import { ReportsRepository } from './reports.repository';
import { ReportFilterDto } from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  async getTaskCompletionReport(filterDto: ReportFilterDto) {
    return this.reportsRepository.getTaskCompletionReport({
      projectId: filterDto.projectId,
      assigneeId: filterDto.assigneeId,
      dateFrom: filterDto.dateFrom,
      dateTo: filterDto.dateTo,
    });
  }

  async getOverdueTasks() {
    return this.reportsRepository.getOverdueTasks();
  }

  async getEmployeeReport(userId: string, filterDto: ReportFilterDto) {
    return this.reportsRepository.getEmployeeReport(userId, {
      dateFrom: filterDto.dateFrom,
      dateTo: filterDto.dateTo,
    });
  }

  async getProjectReport(projectId: string) {
    return this.reportsRepository.getProjectReport(projectId);
  }
}
