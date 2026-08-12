import type { User } from './user.types';
import type { Label } from './label.types';
import type { TaskPriority, TaskStatus } from './task.types';

export interface KanbanCard {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  position: number;
  dueDate?: string;
  assignee?: Pick<User, 'id' | 'name' | 'avatar'>;
  labels: Label[];
  checklistProgress?: { total: number; completed: number };
  commentCount: number;
}

export interface KanbanColumn {
  status: TaskStatus;
  tasks: KanbanCard[];
}

export interface KanbanBoard {
  projectId: string;
  columns: Record<TaskStatus, KanbanCard[]>;
}
