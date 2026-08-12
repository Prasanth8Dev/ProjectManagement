'use client';
import { useActivity } from '@/hooks/use-activity';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/utils/date';
import { ActivityLog, ActivityAction } from '@/types/activity.types';
import { cn } from '@/lib/utils/cn';

function formatActivityMessage(log: ActivityLog): string {
  const title = log.entityTitle ? `"${log.entityTitle}"` : log.entityType.toLowerCase();
  const map: Partial<Record<ActivityAction, string>> = {
    CREATED: `created ${log.entityType.toLowerCase()} ${title}`,
    UPDATED: `updated ${log.entityType.toLowerCase()} ${title}`,
    DELETED: `deleted ${log.entityType.toLowerCase()} ${title}`,
    ASSIGNED: `was assigned to ${title}`,
    STATUS_CHANGED: `changed status of ${title}`,
    PRIORITY_CHANGED: `changed priority of ${title}`,
    COMMENTED: `commented on ${title}`,
    ARCHIVED: `archived ${title}`,
    MEMBER_ADDED: `added a member to ${title}`,
    MEMBER_REMOVED: `removed a member from ${title}`,
  };
  return map[log.action] ?? `performed an action on ${title}`;
}

interface ActivityFeedProps {
  projectId?: string;
  userId?: string;
  taskId?: string;
  teamId?: string;
  limit?: number;
  className?: string;
}

export function ActivityFeed({ projectId, userId, taskId, limit = 10, className }: ActivityFeedProps) {
  const { data, isLoading } = useActivity({
    projectId,
    userId,
    taskId,
    limit,
    page: 1,
  });

  const activities = data?.data ?? [];

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-7 w-7 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities.length) {
    return (
      <p className={cn('text-sm text-muted-foreground text-center py-6', className)}>
        No activity yet
      </p>
    );
  }

  return (
    <ul className={cn('space-y-3', className)}>
      {activities.map((log) => (
        <li key={log.id} className="flex items-start gap-3">
          <UserAvatar user={log.user} size="sm" className="shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-snug">
              <span className="font-medium">{log.user.name}</span>{' '}
              <span className="text-muted-foreground">{formatActivityMessage(log)}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatRelativeTime(log.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
