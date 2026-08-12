import api from './axios';
import type { DashboardStats, DashboardCharts } from '@/types/dashboard.types';
import type { Task } from '@/types/task.types';
import type { ActivityLog } from '@/types/activity.types';

export async function getDashboardStats(userId?: string): Promise<DashboardStats> {
  return api.get('/dashboard/stats', { params: userId ? { userId } : undefined });
}

export async function getDashboardCharts(userId?: string): Promise<DashboardCharts> {
  return api.get('/dashboard/charts', { params: userId ? { userId } : undefined });
}

export async function getTodayTasks(userId?: string): Promise<Task[]> {
  return api.get('/dashboard/today-tasks', { params: userId ? { userId } : undefined });
}

export async function getUpcomingDeadlines(days = 7, userId?: string): Promise<Task[]> {
  return api.get('/dashboard/upcoming-deadlines', {
    params: { days, ...(userId ? { userId } : {}) },
  });
}

export async function getRecentActivity(limit = 10): Promise<ActivityLog[]> {
  return api.get('/dashboard/recent-activity', { params: { limit } });
}
