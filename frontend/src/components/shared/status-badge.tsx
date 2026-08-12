import { TASK_STATUS_CONFIG } from '@/constants/task-statuses';
import { TaskStatus } from '@/types/task.types';
import { ProjectStatus } from '@/types/project.types';
import { cn } from '@/lib/utils/cn';

const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: string; bgColor: string }
> = {
  PLANNING: {
    label: 'Planning',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
  },
  ACTIVE: {
    label: 'Active',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/30',
  },
  ON_HOLD: {
    label: 'On Hold',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30',
  },
  ARCHIVED: {
    label: 'Archived',
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-50 dark:bg-slate-800/60',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/30',
  },
};

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
  showIcon?: boolean;
}

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function TaskStatusBadge({
  status,
  className,
  showIcon = true,
}: TaskStatusBadgeProps) {
  const config = TASK_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        config.bgColor,
        config.color,
        className
      )}
    >
      {showIcon && (
        <span className="text-xs leading-none">{config.icon}</span>
      )}
      {config.label}
    </span>
  );
}

export function ProjectStatusBadge({
  status,
  className,
}: ProjectStatusBadgeProps) {
  const config = PROJECT_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        config.bgColor,
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}
