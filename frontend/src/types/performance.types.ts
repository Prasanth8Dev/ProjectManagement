import type { TaskStatus, TaskPriority } from './task.types';
import type { BugStatus, BugSeverity, BugPlatform } from './bug.types';
import type { Intervention } from './intervention.types';

export interface PerformanceUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  jobTitle?: string | null;
  department?: string | null;
}

export interface EmployeePerformanceSummary {
  user: PerformanceUser;
  tasksAssigned: number;
  tasksCompleted: number;
  completionRate: number;
  etaBreaches: number;
  mistakesCount: number;
  bugsOpen: number;
  reworkCount: number;
  interventionsCount: number;
}

export interface PerformanceProjectRef {
  id: string;
  name: string;
  color?: string | null;
}

export interface PerformanceTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  projectId?: string | null;
  createdAt: string;
  project?: PerformanceProjectRef | null;
}

export interface PerformanceBug {
  id: string;
  title: string;
  status: BugStatus;
  severity: BugSeverity;
  priority: string;
  platform?: BugPlatform | null;
  assigneeId?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
  project?: PerformanceProjectRef | null;
}

export interface PerformanceReworkEvent {
  type: 'task' | 'bug';
  id: string;
  title: string;
  userId: string;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
}

export interface EmployeePerformanceDetail {
  user: PerformanceUser & { status: string };
  stats: {
    tasksAssigned: number;
    tasksCompleted: number;
    completionRate: number;
    etaBreaches: number;
    mistakesCount: number;
    bugsOpen: number;
    reworkCount: number;
    interventionsCount: number;
  };
  tasks: PerformanceTask[];
  bugs: PerformanceBug[];
  etaBreachedTasks: PerformanceTask[];
  reworkEvents: PerformanceReworkEvent[];
  interventions: Intervention[];
}
