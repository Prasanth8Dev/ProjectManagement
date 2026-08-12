import type { User } from './user.types';
import type { DailyWorkUpdate } from './daily-update.types';

export interface TaskReport {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  inProgress: number;
  completionRate: number;
  // Daily report fields
  userSummaries?: Array<{
    user?: { id: string; name: string; avatar?: string };
    project?: { id: string; name: string };
    tasksDone?: number;
    hoursWorked?: number;
    hasBlockers?: boolean;
  }>;
  blockedTasks?: Array<{ id: string; title: string; assignee?: { name: string }; project?: { name: string }; blockerDescription?: string }>;
  // Weekly report fields
  userStats?: Array<{
    user?: { id: string; name: string; avatar?: string };
    tasksCompleted?: number;
    hoursWorked?: number;
    updatesSubmitted?: number;
    completionRate?: number;
  }>;
  // Project report fields
  stats?: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    completionRate: number;
    openMilestones?: number;
  };
  taskBreakdown?: Array<{ status: string; count: number }>;
  milestones?: Array<{ id: string; name: string; status: string; dueDate?: string; completedAt?: string }>;
  memberContributions?: Array<{
    user?: { id: string; name: string; avatar?: string };
    tasksCompleted?: number;
    hoursWorked?: number;
  }>;
}

export interface EmployeeReport {
  user: User;
  tasksAssigned: number;
  tasksCompleted: number;
  hoursWorked: number;
  updatesSubmitted: number;
  // Extended fields used by the employee report page
  stats?: {
    totalTasks: number;
    tasksAssigned?: number;
    completedTasks: number;
    tasksCompleted?: number;
    inProgressTasks: number;
    hoursLogged: number;
    hoursWorked?: number;
    updatesCount?: number;
  };
  weeklyStats?: Array<{
    week: string;
    tasksCompleted: number;
    hoursWorked: number;
  }>;
  recentUpdates?: DailyWorkUpdate[];
}
