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
  | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ChecklistItem {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  completedAt?: string;
}

export interface TaskHistoryEntry {
  id: string;
  taskId: string;
  action?: string;
  field: string;
  oldValue?: string;
  newValue?: string;
  user: User;
  createdAt: string;
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
