import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationFilterParams,
} from '@/lib/api/notifications.api';

export const useNotifications = (userId: string | undefined, params?: NotificationFilterParams) =>
  useQuery({
    queryKey: QUERY_KEYS.notifications.list(userId ?? '', params),
    queryFn: () => getNotifications(userId as string, params),
    enabled: !!userId,
    staleTime: 15_000,
  });

export const useUnreadNotificationCount = (userId: string | undefined) =>
  useQuery({
    queryKey: QUERY_KEYS.notifications.unreadCount(userId ?? ''),
    queryFn: () => getUnreadCount(userId as string),
    enabled: !!userId,
    staleTime: 15_000,
    refetchInterval: 30_000, // poll so the badge stays fresh without a websocket
    select: (resp: any): number => resp?.data?.count ?? 0,
  });

export const useMarkNotificationRead = (userId: string | undefined) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
  });
};

export const useMarkAllNotificationsRead = (userId: string | undefined) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(userId as string),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
  });
};
