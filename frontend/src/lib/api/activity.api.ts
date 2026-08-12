import api from './axios';
import type { ActivityLog } from '@/types/activity.types';
import type { PaginationParams, PaginatedResponse } from '@/types/api.types';

export interface ActivityFilterParams extends PaginationParams {
  userId?: string;
  projectId?: string;
  taskId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export async function getActivity(
  params?: ActivityFilterParams
): Promise<PaginatedResponse<ActivityLog>> {
  return api.get('/activity', { params });
}
