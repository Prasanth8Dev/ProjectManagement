import api from './axios';
import type { TaskReport, EmployeeReport } from '@/types/report.types';
import type { Task } from '@/types/task.types';
import type { ApiResponse } from '@/types/api.types';

export interface TaskReportParams {
  projectId?: string;
  startDate?: string;
  endDate?: string;
  assigneeId?: string;
}

export interface OverdueTasksParams {
  projectId?: string;
  assigneeId?: string;
}

export interface EmployeeReportParams {
  startDate?: string;
  endDate?: string;
}

export interface ProjectReportParams {
  startDate?: string;
  endDate?: string;
}

export async function getTaskReport(params?: TaskReportParams): Promise<ApiResponse<TaskReport>> {
  return api.get('/reports/tasks', { params });
}

export async function getOverdueTasks(params?: OverdueTasksParams): Promise<Task[]> {
  return api.get('/reports/overdue', { params });
}

export async function getEmployeeReport(
  userId: string,
  params?: EmployeeReportParams
): Promise<ApiResponse<EmployeeReport>> {
  return api.get(`/reports/employee/${userId}`, { params });
}

export async function getProjectReport(
  projectId: string,
  params?: ProjectReportParams
): Promise<ApiResponse<TaskReport>> {
  return api.get(`/reports/project/${projectId}`, { params });
}
