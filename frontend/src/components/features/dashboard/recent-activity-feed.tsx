'use client';
import { useRecentDashboardActivity as useRecentActivity } from '@/hooks/use-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime as formatRelative } from '@/lib/utils/date';
import { ActivityLog, ActivityAction } from '@/types/activity.types';

function formatActivityMessage(log: ActivityLog): string {
  const title = log.entityTitle ? `"${log.entityTitle}"` : log.entityType.toLowerCase();
  const actionMessages: Partial<Record<ActivityAction, string>> = {
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
  return actionMessages[log.action] ?? `performed an action on ${title}`;
}

export function RecentActivityFeed() {
  const { data: activities, isLoading } = useRecentActivity(10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          <div className="px-6 pb-4">
            {isLoading ? (
              <div className="space-y-4 pt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !activities || activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            ) : (
              <ul className="space-y-3 pt-2">
                {activities.map((log) => (
                  <li key={log.id} className="flex items-start gap-3">
                    <UserAvatar user={log.user} size="sm" className="shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">
                        <span className="font-medium">{log.user.name}</span>{' '}
                        <span className="text-muted-foreground">
                          {formatActivityMessage(log)}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatRelative(log.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
