import type { User } from './user.types';

export type ActivityAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'ASSIGNED'
  | 'REASSIGNED'
  | 'COMMENTED'
  | 'STATUS_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'DUE_DATE_CHANGED'
  | 'MEMBER_ADDED'
  | 'MEMBER_REMOVED'
  | 'ATTACHMENT_ADDED'
  | 'ARCHIVED'
  | 'MILESTONE_REACHED';

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  entityType: string;
  entityId: string;
  entityTitle?: string;
  metadata?: Record<string, unknown>;
  user: User;
  project?: { id: string; name: string };
  task?: { id: string; title: string };
  createdAt: string;
}
