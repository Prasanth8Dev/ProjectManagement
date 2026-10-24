import type { User } from './user.types';
import type { TaskPriority } from './task.types';

export type MeetingType =
  | 'STANDUP'
  | 'SPRINT_PLANNING'
  | 'SPRINT_REVIEW'
  | 'CLIENT_MEETING'
  | 'TECHNICAL_DISCUSSION'
  | 'RCA'
  | 'GENERAL';

export type ActionItemStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CONVERTED';

export interface MeetingParticipant {
  meetingId: string;
  userId: string;
  user: User;
}

export interface ActionItemTaskRef {
  id: string;
  title: string;
  status: string;
}

export interface MeetingActionItem {
  id: string;
  meetingId: string;
  title: string;
  description?: string | null;
  assigneeId?: string | null;
  assignee?: User | null;
  priority: TaskPriority;
  dueDate?: string | null;
  status: ActionItemStatus;
  taskId?: string | null;
  task?: ActionItemTaskRef | null;
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number };
}

export interface Meeting {
  id: string;
  projectId: string;
  title: string;
  type: MeetingType;
  scheduledAt: string;
  duration?: number | null;
  organizerId?: string | null;
  organizer?: User | null;
  description?: string | null;

  momSummary?: string | null;
  discussionPoints?: string | null;
  decisionsMade?: string | null;
  risksBlockers?: string | null;
  additionalNotes?: string | null;

  participants: MeetingParticipant[];
  actionItems?: MeetingActionItem[];
  _count?: { actionItems: number };

  createdAt: string;
  updatedAt: string;
}
