import {
  TASK_PRIORITY_CONFIG,
  PROJECT_PRIORITY_CONFIG,
} from '@/constants/priorities';
import { TaskPriority } from '@/types/task.types';
import { ProjectPriority } from '@/types/project.types';
import { cn } from '@/lib/utils/cn';

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
  showDot?: boolean;
}

interface ProjectPriorityBadgeProps {
  priority: ProjectPriority;
  className?: string;
  showDot?: boolean;
}

export function TaskPriorityBadge({
  priority,
  className,
  showDot = true,
}: TaskPriorityBadgeProps) {
  const config = TASK_PRIORITY_CONFIG[priority];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        config.bgColor,
        config.color,
        className
      )}
    >
      {showDot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', config.dotColor)} />
      )}
      {config.label}
    </span>
  );
}

export function ProjectPriorityBadge({
  priority,
  className,
  showDot = true,
}: ProjectPriorityBadgeProps) {
  const config = PROJECT_PRIORITY_CONFIG[priority];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        config.bgColor,
        config.color,
        className
      )}
    >
      {showDot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', config.dotColor)} />
      )}
      {config.label}
    </span>
  );
}
