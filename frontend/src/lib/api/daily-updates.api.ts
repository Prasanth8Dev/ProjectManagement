import api from './axios';
import type { DailyWorkUpdate } from '@/types/daily-update.types';
import type { ApiResponse, PaginationParams, PaginatedResponse } from '@/types/api.types';
import type { CreateDailyUpdateInput } from '@/lib/validators/update.schema';

export interface DailyUpdateFilterParams extends PaginationParams {
  userId?: string;
  projectId?: string;
  teamId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}

export interface DailyReportParams {
  date: string;
}

export interface WeeklyReportParams {
  startDate: string;
  endDate: string;
}

export async function getDailyUpdates(
  params?: DailyUpdateFilterParams
): Promise<PaginatedResponse<DailyWorkUpdate>> {
  return api.get('/daily-updates', { params });
}

export async function getDailyUpdate(id: string): Promise<ApiResponse<DailyWorkUpdate>> {
  return api.get(`/daily-updates/${id}`);
}

export async function createDailyUpdate(data: CreateDailyUpdateInput): Promise<DailyWorkUpdate> {
  return api.post('/daily-updates', data);
}

export async function updateDailyUpdate(
  id: string,
  data: Partial<CreateDailyUpdateInput>
): Promise<DailyWorkUpdate> {
  return api.patch(`/daily-updates/${id}`, data);
}

export async function deleteDailyUpdate(id: string): Promise<void> {
  return api.delete(`/daily-updates/${id}`);
}

export async function getTodayUpdate(userId: string): Promise<DailyWorkUpdate | null> {
  return api.get(`/daily-updates/today`, { params: { userId } });
}

export async function getDailyReport(params: DailyReportParams): Promise<unknown> {
  return api.get('/reports/daily', { params });
}

export async function getWeeklyReport(params: WeeklyReportParams): Promise<unknown> {
  return api.get('/reports/weekly', { params });
}
