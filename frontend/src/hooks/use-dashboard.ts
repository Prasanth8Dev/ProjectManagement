import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import {
  getDashboardStats,
  getDashboardCharts,
  getTodayTasks,
  getUpcomingDeadlines,
  getRecentActivity,
} from '@/lib/api/dashboard.api';
import { useAuthStore } from '@/stores/auth.store';
import type { DashboardStats, DashboardCharts } from '@/types/dashboard.types';
import type { Task } from '@/types/task.types';
import type { ActivityLog } from '@/types/activity.types';

/** Returns the userId to scope dashboard data — only for DEVELOPER role */
function useScopeUserId(): string | undefined {
  const user = useAuthStore((s) => s.currentUser);
  return user?.role === 'DEVELOPER' ? user.id : undefined;
}

export const useDashboardStats = () => {
  const userId = useScopeUserId();
  return useQuery({
    queryKey: [...QUERY_KEYS.dashboard.stats, userId],
    queryFn: () => getDashboardStats(userId),
    staleTime: 60_000,
    select: (d: any): DashboardStats => d?.data ?? d,
  });
};

export const useDashboardCharts = () => {
  const userId = useScopeUserId();
  return useQuery({
    queryKey: [...QUERY_KEYS.dashboard.charts, userId],
    queryFn: () => getDashboardCharts(userId),
    staleTime: 60_000,
    select: (d: any): DashboardCharts => d?.data ?? d,
  });
};

export const useTodayTasks = () => {
  const userId = useScopeUserId();
  return useQuery({
    queryKey: [...QUERY_KEYS.dashboard.todayTasks, userId],
    queryFn: () => getTodayTasks(userId),
    staleTime: 30_000,
    select: (d: any): Task[] => d?.data ?? d,
  });
};

export const useUpcomingDeadlines = (days = 7) => {
  const userId = useScopeUserId();
  return useQuery({
    queryKey: [...QUERY_KEYS.dashboard.upcoming, days, userId],
    queryFn: () => getUpcomingDeadlines(days, userId),
    staleTime: 60_000,
    select: (d: any): Task[] => d?.data ?? d,
  });
};

export const useRecentDashboardActivity = (limit = 10) =>
  useQuery({
    queryKey: [...QUERY_KEYS.dashboard.recentActivity, limit],
    queryFn: () => getRecentActivity(limit),
    staleTime: 30_000,
    select: (d: any): ActivityLog[] => d?.data ?? d,
  });
