export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: MilestoneStatus;
  dueDate: string;
  completedAt?: string;
  createdAt: string;
  _count?: {
    tasks: number;
  };
}
