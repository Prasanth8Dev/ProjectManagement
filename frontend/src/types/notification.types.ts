export type NotificationType =
  | 'MENTION'
  | 'TASK_ASSIGNED'
  | 'BUG_ASSIGNED'
  | 'TASK_COMMENT'
  | 'BUG_COMMENT'
  | 'BUG_LINKED_TO_TASK'
  | 'TASK_BLOCKED'
  | 'TASK_UNBLOCKED'
  | 'TASK_ETA_APPROACHING'
  | 'TASK_OVERDUE'
  | 'TASK_COMPLETED'
  | 'REVIEW_REQUESTED'
  | 'MOM_ACTION_ITEM_ASSIGNED'
  | 'MOM_ACTION_ITEM_DUE_SOON'
  | 'DAILY_UPDATE_REPLY'
  | 'INTERVENTION_LOGGED';

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
  meetingId?: string | null;
  actionItemId?: string | null;
  dailyUpdateId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}
