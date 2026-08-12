'use client';
import { useTaskHistory } from '@/hooks/use-tasks';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime as formatRelative } from '@/lib/utils/date';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TaskHistoryEntry } from '@/types/task.types';

interface TaskHistoryProps {
  taskId: string;
}

function formatHistoryMessage(entry: TaskHistoryEntry): React.ReactNode {
  switch (entry.action) {
    case 'STATUS_CHANGED':
      return (
        <>
          changed status from{' '}
          <span className="font-medium text-foreground line-through text-xs">
            {entry.oldValue}
          </span>{' '}
          to{' '}
          <span className="font-medium text-foreground">{entry.newValue}</span>
        </>
      );
    case 'PRIORITY_CHANGED':
      return (
        <>
          changed priority from{' '}
          <span className="font-medium text-foreground line-through text-xs">
            {entry.oldValue}
          </span>{' '}
          to{' '}
          <span className="font-medium text-foreground">{entry.newValue}</span>
        </>
      );
    case 'ASSIGNED':
      return (
        <>
          assigned task to{' '}
          <span className="font-medium text-foreground">{entry.newValue}</span>
        </>
      );
    case 'CREATED':
      return <span>created this task</span>;
    case 'UPDATED':
      return (
        <>
          updated{' '}
          <span className="font-medium text-foreground">{entry.field}</span>
          {entry.oldValue && entry.newValue ? (
            <>
              {' '}
              from{' '}
              <span className="line-through text-xs">{entry.oldValue}</span> to{' '}
              <span className="font-medium text-foreground">
                {entry.newValue}
              </span>
            </>
          ) : null}
        </>
      );
    case 'COMPLETED':
      return <span>marked task as completed</span>;
    default:
      return (
        <span>{(entry.action ?? entry.field ?? 'updated').toLowerCase().replace(/_/g, ' ')}</span>
      );
  }
}

export function TaskHistory({ taskId }: TaskHistoryProps) {
  const { data: history, isLoading } = useTaskHistory(taskId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <Skeleton className="h-6 w-6 rounded-full" />
              {i < 4 && (
                <div className="w-px flex-1 bg-border mt-1 min-h-6" />
              )}
            </div>
            <div className="flex-1 pb-4 space-y-1">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No history yet.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {history.map((entry, idx) => {
        const isLast = idx === history.length - 1;
        return (
          <div key={entry.id} className="flex gap-3">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <UserAvatar
                user={entry.user}
                size="xs"
                className="shrink-0 mt-0.5"
              />
              {!isLast && (
                <div className="w-px flex-1 bg-border mt-1 min-h-6" />
              )}
            </div>

            {/* Content */}
            <div className={cn('flex-1 pb-4', isLast && 'pb-0')}>
              <p className="text-sm leading-snug">
                <span className="font-medium">{entry.user.name}</span>{' '}
                <span className="text-muted-foreground">
                  {formatHistoryMessage(entry)}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatRelative(entry.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
