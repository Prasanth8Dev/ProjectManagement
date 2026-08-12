'use client';
import Link from 'next/link';
import { useTodayTasks } from '@/hooks/use-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskStatusBadge } from '@/components/shared/status-badge';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ROUTES } from '@/constants/routes';
import { TASK_PRIORITY_CONFIG } from '@/constants/priorities';
import { cn } from '@/lib/utils/cn';

export function TodayTasksList() {
  const { data: tasks, isLoading } = useTodayTasks();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Due Today</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-72">
          <div className="px-6 pb-4">
            {isLoading ? (
              <div className="space-y-3 pt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                ))}
              </div>
            ) : !tasks || tasks.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-2xl mb-2">🎉</p>
                <p className="text-sm text-muted-foreground">No tasks due today!</p>
              </div>
            ) : (
              <ul className="space-y-2 pt-2">
                {tasks.map((task) => {
                  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];
                  return (
                    <li key={task.id}>
                      <Link
                        href={ROUTES.TASK(task.id)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group"
                      >
                        <span
                          className={cn(
                            'h-2 w-2 rounded-full shrink-0',
                            priorityConfig.dotColor
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            {task.title}
                          </p>
                          <TaskStatusBadge status={task.status} showIcon={false} />
                        </div>
                        {task.assignee && (
                          <UserAvatar
                            user={task.assignee}
                            size="xs"
                            showTooltip
                            className="shrink-0"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
