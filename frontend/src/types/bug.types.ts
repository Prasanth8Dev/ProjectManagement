export type BugStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'PENDING'
  | 'IN_REVIEW'
  | 'RESOLVED'
  | 'REOPENED'
  | 'CLOSED'
  | 'WONT_FIX';
export type BugSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type BugPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type BugPlatform = 'IOS' | 'ANDROID' | 'BACKEND' | 'FRONTEND';

export interface BugUser {
  id: string;
  name: string;
  avatar?: string | null;
  email: string;
}

export interface BugProject {
  id: string;
  name: string;
  color?: string | null;
  slug: string;
}

export interface Bug {
  id: string;
  title: string;
  description?: string | null;
  stepsToReproduce?: string | null;
  expectedBehavior?: string | null;
  actualBehavior?: string | null;
  environment?: string | null;

  status: BugStatus;
  severity: BugSeverity;
  priority: BugPriority;
  platform?: BugPlatform | null;

  projectId?: string | null;
  assigneeId?: string | null;
  reporterId: string;

  resolvedAt?: string | null;
  closedAt?: string | null;
  isArchived: boolean;

  createdAt: string;
  updatedAt: string;

  project?: BugProject | null;
  assignee?: BugUser | null;
  reporter: BugUser;
}
