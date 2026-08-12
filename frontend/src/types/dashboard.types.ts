export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  totalMembers: number;
  overdueTasksCount: number;
  todayUpdatesCount: number;
}

export interface TaskByStatus {
  status: string;
  count: number;
  color?: string;
}

export interface WeeklyProgress {
  day: string;
  completed: number;
  created: number;
}

export interface ProjectProgress {
  id?: string;
  projectId: string;
  name: string;
  total: number;
  totalTasks: number;
  completed: number;
  completedTasks: number;
  percent: number;
  percentage: number;
  color: string;
}

export interface DashboardCharts {
  tasksByStatus: TaskByStatus[];
  weeklyProgress: WeeklyProgress[];
  projectProgress: ProjectProgress[];
}
