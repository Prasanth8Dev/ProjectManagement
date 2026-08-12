'use client';
import { useRouter } from 'next/navigation';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, MessageSquare, CheckSquare2 } from 'lucide-react';
import { Task } from '@/types/task.types';
import { UserAvatar } from '@/components/shared/user-avatar';
import { TASK_PRIORITY_CONFIG } from '@/constants/priorities';
import { ROUTES } from '@/constants/routes';
import { formatDate, isOverdue } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

interface KanbanCardProps {
  task: Task;
  onClick?: () => void;
  isDragOverlay?: boolean;
}

export function KanbanCard({ task, onClick, isDragOverlay }: KanbanCardProps) {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const overdue =
    isOverdue(task.dueDate ?? '') &&
    task.status !== 'DONE' &&
    task.status !== 'CANCELLED';

  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(ROUTES.TASK(task.id));
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={!isDragging ? handleClick : undefined}
      className={cn(
        'bg-card border rounded-lg p-3 cursor-grab active:cursor-grabbing',
        'hover:shadow-md transition-all duration-150 space-y-2 select-none',
        isDragging && 'opacity-40 shadow-lg scale-95',
        isDragOverlay && 'shadow-2xl opacity-100 cursor-grabbing rotate-2'
      )}
    >
      {/* Priority dot + title */}
      <div className="flex items-start gap-1.5">
        <span
          className={cn(
            'h-2 w-2 rounded-full shrink-0 mt-1.5',
            priorityConfig.dotColor
          )}
          title={priorityConfig.label}
        />
        <p className="text-sm font-medium line-clamp-2 flex-1 leading-snug">
          {task.title}
        </p>
      </div>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{
                backgroundColor: label.color + '22',
                color: label.color,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer: stats + assignee + due date */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {(task.checklistProgress?.total ?? 0) > 0 && (
            <span
              className={cn(
                'flex items-center gap-0.5',
                task.checklistProgress?.completed ===
                  task.checklistProgress?.total && 'text-green-500'
              )}
            >
              <CheckSquare2 className="h-3 w-3" />
              {task.checklistProgress?.completed}/{task.checklistProgress?.total}
            </span>
          )}
          {(task.commentCount ?? 0) > 0 && (
            <span className="flex items-center gap-0.5">
              <MessageSquare className="h-3 w-3" />
              {task.commentCount}
            </span>
          )}
          {task.dueDate && (
            <span
              className={cn(
                'flex items-center gap-0.5',
                overdue ? 'text-red-500 font-medium' : ''
              )}
            >
              <CalendarDays className="h-3 w-3" />
              {formatDate(task.dueDate, 'MMM d')}
            </span>
          )}
        </div>
        {task.assignee && (
          <UserAvatar user={task.assignee} size="xs" showTooltip />
        )}
      </div>
    </div>
  );
}
