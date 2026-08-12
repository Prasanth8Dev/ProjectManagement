import type { User } from './user.types';

export type ProjectStatus =
  | 'PLANNING'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'ARCHIVED'
  | 'CANCELLED';

export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ProjectMemberRole = 'OWNER' | 'MANAGER' | 'DEVELOPER' | 'VIEWER';

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  joinedAt: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  color: string;
  icon?: string;
  startDate?: string;
  endDate?: string;
  isArchived: boolean;
  createdAt: string;
  members?: ProjectMember[];
  _count?: {
    tasks: number;
    members: number;
  };
}

export interface ProjectStats {
  total: number;
  totalTasks: number;
  completed: number;
  completedTasks: number;
  inProgress: number;
  inProgressTasks: number;
  pending: number;
  overdue: number;
  overdueTasks: number;
  completionRate?: number;
}

export type ProjectWithStats = Project & {
  completedTasks?: number;
};
