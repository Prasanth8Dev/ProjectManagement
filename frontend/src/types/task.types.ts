import type { User } from './user.types';
import type { Project } from './project.types';
import type { Milestone } from './milestone.types';
import type { Label } from './label.types';

export type TaskStatus =
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'TESTING'
  | 'DONE'
  | 'CLOSED'
  | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskEventType =
  | 'TASK_CREATED'
  | 'TASK_ASSIGNED'
  | 'TASK_REASSIGNED'
  | 'TASK_STARTED'
  | 'TASK_PAUSED'
  | 'TASK_RESUMED'
  | 'TASK_BLOCKED'
  | 'TASK_UNBLOCKED'
  | 'TASK_COMPLETED'
  | 'REVIEW_STARTED'
  | 'REVIEW_COMPLETED'
  | 'TASK_CLOSED'
  | 'COMMENT_ADDED'
  | 'STATUS_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'ETA_CHANGED';

export interface ChecklistItem {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  completedAt?: string;
}

/** One immutable entry from the TaskActivity event log. */
export interface TaskActivityEvent {
  id: string;
  taskId: string;
  eventType: TaskEventType;
  previousValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
  comment?: string | null;
  user: User | null;
  createdAt: string;
}

// Kept as an alias so any lingering references still compile — prefer TaskActivityEvent.
export type TaskHistoryEntry = TaskActivityEvent;

export interface TaskTimeTracking {
  historicalTrackingUnavailable: boolean;
  assignedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  assignToStartMs: number | null;
  startToCompletionMs: number | null;
  assignToCompletionMs: number | null;
  pausedDurationMs: number;
  blockedDurationMs: number;
  reviewDurationMs: number;
  activeWorkingTimeMs: number | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  position: number;
  isArchived: boolean;
  assignedAt?: string | null;
  startedAt?: string | null;
  isPaused: boolean;
  isBlocked: boolean;
  blockedReason?: string | null;
  reporterId?: string;
  project: Project;
  projectId?: string;
  milestone?: Milestone;
  milestoneId?: string;
  assignee?: User;
  assigneeId?: string;
  reporter?: User;
  parentTaskId?: string;
  labels: Label[];
  _count?: {
    subtasks: number;
    comments: number;
    attachments: number;
    checklistItems: number;
  };
  checklistProgress?: {
    total: number;
    completed: number;
  };
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
}
