export type NotificationType =
  | 'MENTION'
  | 'TASK_ASSIGNED'
  | 'BUG_ASSIGNED'
  | 'TASK_COMMENT'
  | 'BUG_COMMENT'
  | 'BUG_LINKED_TO_TASK';

export interface NotificationActor {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface AppNotification {
  id: string;
  userId: string;
  actorId?: string | null;
  actor?: NotificationActor | null;
  type: NotificationType;
  title: string;
  message?: string | null;
  link?: string | null;
  taskId?: string | null;
  bugId?: string | null;
  commentId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}
