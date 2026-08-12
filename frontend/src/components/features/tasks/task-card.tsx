'use client';
import Link from 'next/link';
import { CalendarDays, MessageSquare, CheckSquare2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { TaskStatusBadge } from '@/components/shared/status-badge';
import { TaskPriorityBadge } from '@/components/shared/priority-badge';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Task } from '@/types/task.types';
import { ROUTES } from '@/constants/routes';
import { TASK_PRIORITY_CONFIG } from '@/constants/priorities';
import { formatDate, isOverdue } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

// Border colors per priority
const PRIORITY_BORDER: Record<string, string> = {
  LOW: 'border-l-blue-400',
  MEDIUM: 'border-l-yellow-400',
  HIGH: 'border-l-orange-500',
  URGENT: 'border-l-red-500',
};

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  className?: string;
}

export function TaskCard({ task, onClick, className }: TaskCardProps) {
  const overdue =
    isOverdue(task.dueDate ?? '') &&
    task.status !== 'DONE' &&
    task.status !== 'CANCELLED';

  const hasChecklist = (task.checklistProgress?.total ?? 0) > 0;
  const checklistDone =
    hasChecklist &&
    task.checklistProgress?.completed === task.checklistProgress?.total;

  const content = (
    <motion.div whileHover={{ scale: 1.01, y: -1 }} transition={{ duration: 0.15 }}>
      <Card
        className={cn(
          'cursor-pointer border-l-4 hover:shadow-md transition-shadow',
          PRIORITY_BORDER[task.priority] ?? 'border-l-muted',
          className
        )}
        onClick={onClick}
      >
        <CardContent className="p-4 space-y-3">
          {/* Title + priority */}
          <div className="flex items-start gap-2">
            <h3 className="text-sm font-medium line-clamp-2 flex-1 leading-snug">
              {task.title}
            </h3>
            <div className="shrink-0">
              <span
                className={cn(
                  'h-2 w-2 rounded-full inline-block mt-1.5',
                  TASK_PRIORITY_CONFIG[task.priority]?.dotColor
                )}
              />
            </div>
          </div>

          {/* Label chips */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.labels.map((label) => (
                <span
                  key={label.id}
                  className="text-xs px-1.5 py-0.5 rounded font-medium"
                  style={{
                    backgroundColor: label.color + '22',
                    color: label.color,
                    border: `1px solid ${label.color}44`,
                  }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <TaskStatusBadge status={task.status} showIcon={false} />
            </div>
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground shrink-0">
              {hasChecklist && (
                <span
                  className={cn(
                    'flex items-center gap-0.5',
                    checklistDone && 'text-green-500'
                  )}
                >
                  <CheckSquare2 className="h-3.5 w-3.5" />
                  {task.checklistProgress?.completed}/
                  {task.checklistProgress?.total}
                </span>
              )}
              {(task.commentCount ?? 0) > 0 && (
                <span className="flex items-center gap-0.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {task.commentCount}
                </span>
              )}
            </div>
          </div>

          {/* Due date + assignee */}
          <div className="flex items-center justify-between gap-2">
            {task.dueDate ? (
              <span
                className={cn(
                  'text-xs flex items-center gap-1',
                  overdue
                    ? 'text-red-500 font-medium'
                    : 'text-muted-foreground'
                )}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(task.dueDate, 'MMM d')}
                {overdue && ' (overdue)'}
              </span>
            ) : (
              <div />
            )}
            {task.assignee && (
              <UserAvatar user={task.assignee} size="xs" showTooltip />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (onClick) return content;

  return <Link href={ROUTES.TASK(task.id)}>{content}</Link>;
}
