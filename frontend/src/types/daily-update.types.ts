import type { User } from './user.types';
import type { Task } from './task.types';
import type { Project } from './project.types';

export type MoodType = number;

export interface DailyWorkUpdateTask {
  id: string;
  taskId: string;
  isCompleted: boolean;
  isBlocked: boolean;
  hoursSpent?: number;
  notes?: string;
  task: Task;
}

export interface DailyWorkUpdate {
  id: string;
  date: string;
  summary: string;
  hoursWorked: number;
  tomorrowPlan?: string;
  blockers?: string;
  mood?: number;
  user: User;
  tasks: DailyWorkUpdateTask[];
  projects: Project[];
  createdAt: string;
  updatedAt: string;
}
