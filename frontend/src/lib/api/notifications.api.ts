import api from './axios';
import type { AppNotification } from '@/types/notification.types';
import type { PaginationParams, PaginatedResponse, ApiResponse } from '@/types/api.types';

export interface NotificationFilterParams extends PaginationParams {
  isRead?: boolean;
}

export async function getNotifications(
  userId: string,
  params?: NotificationFilterParams
): Promise<PaginatedResponse<AppNotification>> {
  return api.get('/notifications', { params: { userId, ...params } });
}

export async function getUnreadCount(userId: string): Promise<ApiResponse<{ count: number }>> {
  return api.get('/notifications/unread-count', { params: { userId } });
}

export async function markNotificationRead(id: string): Promise<ApiResponse<AppNotification>> {
  return api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(userId: string): Promise<ApiResponse<{ success: boolean }>> {
  return api.patch('/notifications/read-all', undefined, { params: { userId } });
}
