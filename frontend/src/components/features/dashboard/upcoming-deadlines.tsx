'use client';
import Link from 'next/link';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { useUpcomingDeadlines } from '@/hooks/use-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { TASK_PRIORITY_CONFIG } from '@/constants/priorities';
import { isOverdue } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { Task } from '@/types/task.types';

function formatDayLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEEE, MMM d');
}

function groupByDate(tasks: Task[]): Map<string, Task[]> {
  const map = new Map<string, Task[]>();
  tasks.forEach((task) => {
    if (!task.dueDate) return;
    const day = task.dueDate.split('T')[0];
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(task);
  });
  return map;
}

export function UpcomingDeadlines() {
  const { data: tasks, isLoading } = useUpcomingDeadlines(7);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          <div className="px-6 pb-4">
            {isLoading ? (
              <div className="space-y-4 pt-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    {Array.from({ length: 2 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-2 pl-2">
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <Skeleton className="h-3.5 flex-1" />
                        <Skeleton className="h-6 w-6 rounded-full" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : !tasks || tasks.length === 0 ? (
              <div className="py-8 text-center">
                <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No deadlines in the next 7 days
                </p>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {Array.from(groupByDate(tasks)).map(([day, dayTasks]) => {
                  const overdue = isOverdue(day);
                  const label = formatDayLabel(day);
                  return (
                    <div key={day} className="space-y-1.5">
                      <h4
                        className={cn(
                          'text-xs font-semibold uppercase tracking-wider',
                          overdue
                            ? 'text-red-500'
                            : 'text-muted-foreground'
                        )}
                      >
                        {overdue ? `Overdue · ${label}` : label}
                      </h4>
                      <ul className="space-y-1">
                        {dayTasks.map((task) => {
                          const priorityConfig =
                            TASK_PRIORITY_CONFIG[task.priority];
                          return (
                            <li key={task.id}>
                              <Link
                                href={ROUTES.TASK(task.id)}
                                className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-accent transition-colors group"
                              >
                                <span
                                  className={cn(
                                    'h-2 w-2 rounded-full shrink-0',
                                    priorityConfig.dotColor
                                  )}
                                />
                                <p
                                  className={cn(
                                    'text-sm truncate flex-1 group-hover:text-primary transition-colors',
                                    overdue && 'text-red-600 dark:text-red-400'
                                  )}
                                >
                                  {task.title}
                                </p>
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
