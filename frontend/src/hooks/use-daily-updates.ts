import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import {
  getDailyUpdates,
  getDailyUpdate,
  createDailyUpdate,
  updateDailyUpdate,
  deleteDailyUpdate,
  getTodayUpdate,
  getDailyReport,
  getWeeklyReport,
  type DailyUpdateFilterParams,
  type DailyReportParams,
  type WeeklyReportParams,
} from '@/lib/api/daily-updates.api';
import type { CreateDailyUpdateInput } from '@/lib/validators/update.schema';

export const useDailyUpdates = (params?: DailyUpdateFilterParams) =>
  useQuery({
    queryKey: QUERY_KEYS.dailyUpdates.list(params),
    queryFn: () => getDailyUpdates(params),
    staleTime: 30_000,
  });

export const useDailyUpdate = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.dailyUpdates.detail(id),
    queryFn: () => getDailyUpdate(id),
    enabled: !!id,
  });

export const useTodayUpdate = (userId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.dailyUpdates.today(userId),
    queryFn: () => getTodayUpdate(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });

export const useCreateDailyUpdate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDailyUpdateInput) => createDailyUpdate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dailyUpdates.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.stats });
    },
  });
};

export const useUpdateDailyUpdate = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateDailyUpdateInput>) => updateDailyUpdate(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dailyUpdates.detail(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dailyUpdates.all });
    },
  });
};

export const useDeleteDailyUpdate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDailyUpdate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dailyUpdates.all });
    },
  });
};

export const useDailyReport = (params: DailyReportParams) =>
  useQuery({
    queryKey: ['reports', 'daily', params],
    queryFn: () => getDailyReport(params),
    enabled: !!params.date,
    staleTime: 60_000,
  });

export const useWeeklyReport = (params: WeeklyReportParams) =>
  useQuery({
    queryKey: ['reports', 'weekly', params],
    queryFn: () => getWeeklyReport(params),
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 60_000,
  });
