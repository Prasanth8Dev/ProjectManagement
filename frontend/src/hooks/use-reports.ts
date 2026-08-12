import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import {
  getTaskReport,
  getOverdueTasks,
  getEmployeeReport,
  getProjectReport,
  type TaskReportParams,
  type OverdueTasksParams,
  type EmployeeReportParams,
  type ProjectReportParams,
} from '@/lib/api/reports.api';

export const useTaskReport = (params?: TaskReportParams) =>
  useQuery({
    queryKey: QUERY_KEYS.reports.tasks(params),
    queryFn: () => getTaskReport(params),
    staleTime: 60_000,
  });

export const useOverdueTasks = (params?: OverdueTasksParams) =>
  useQuery({
    queryKey: QUERY_KEYS.reports.overdue(params),
    queryFn: () => getOverdueTasks(params),
    staleTime: 60_000,
  });

export const useEmployeeReport = (userId: string, params?: EmployeeReportParams) =>
  useQuery({
    queryKey: QUERY_KEYS.reports.employee(userId, params),
    queryFn: () => getEmployeeReport(userId, params),
    enabled: !!userId,
    staleTime: 60_000,
  });

export const useProjectReport = (projectId: string, params?: ProjectReportParams) =>
  useQuery({
    queryKey: QUERY_KEYS.reports.project(projectId, params),
    queryFn: () => getProjectReport(projectId, params),
    enabled: !!projectId,
    staleTime: 60_000,
  });

/** Daily report — uses task report endpoint filtered by a specific date */
export const useDailyReport = (params: { date?: string } & TaskReportParams) =>
  useQuery({
    queryKey: ['reports', 'daily', params],
    queryFn: () => getTaskReport(params),
    staleTime: 60_000,
  });

/** Weekly report — uses task report endpoint filtered by date range */
export const useWeeklyReport = (params: { startDate?: string; endDate?: string } & TaskReportParams) =>
  useQuery({
    queryKey: ['reports', 'weekly', params],
    queryFn: () => getTaskReport(params),
    staleTime: 60_000,
  });
