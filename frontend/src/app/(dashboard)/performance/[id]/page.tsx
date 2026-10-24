'use client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  Bug as BugIcon,
  RefreshCcw,
  MessageSquareWarning,
  ArrowLeft,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TaskStatusBadge } from '@/components/shared/status-badge';
import { BugStatusBadge } from '@/components/features/bugs/bug-status-badge';
import { BugSeverityBadge } from '@/components/features/bugs/bug-severity-badge';
import { usePerformanceDetail } from '@/hooks/use-performance';
import { formatDate, formatRelativeTime } from '@/lib/utils/date';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils/cn';

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${color}`}>{icon}</div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EmployeePerformanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: detail, isLoading, isError } = usePerformanceDetail(id);

  if (isError) {
    return (
      <ErrorState
        title="Failed to load performance detail"
        description="Something went wrong while fetching this employee's performance data."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        onClick={() => router.push(ROUTES.PERFORMANCE)}
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Performance
      </Button>

      {isLoading ? (
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <UserAvatar user={detail!.user} size="xl" />
          <PageHeader
            title={detail!.user.name}
            description={`${detail!.user.jobTitle ?? detail!.user.role.replace(/_/g, ' ')}${
              detail!.user.department ? ` · ${detail!.user.department}` : ''
            }`}
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<ListTodo className="w-5 h-5 text-blue-600" />}
              label="Tasks Assigned"
              value={detail!.stats.tasksAssigned}
              color="bg-blue-50 dark:bg-blue-900/20"
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
              label="Tasks Completed"
              value={detail!.stats.tasksCompleted}
              color="bg-green-50 dark:bg-green-900/20"
            />
            <StatCard
              icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
              label="ETA Breaches"
              value={detail!.stats.etaBreaches}
              color="bg-red-50 dark:bg-red-900/20"
            />
            <StatCard
              icon={<BugIcon className="w-5 h-5 text-amber-600" />}
              label="Mistakes / Bugs"
              value={detail!.stats.mistakesCount}
              color="bg-amber-50 dark:bg-amber-900/20"
            />
            <StatCard
              icon={<RefreshCcw className="w-5 h-5 text-orange-600" />}
              label="Rework Events"
              value={detail!.stats.reworkCount}
              color="bg-orange-50 dark:bg-orange-900/20"
            />
            <StatCard
              icon={<MessageSquareWarning className="w-5 h-5 text-purple-600" />}
              label="Interventions"
              value={detail!.stats.interventionsCount}
              color="bg-purple-50 dark:bg-purple-900/20"
            />
            <Card className="col-span-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-sm font-semibold">{detail!.stats.completionRate}%</p>
                </div>
                <Progress value={detail!.stats.completionRate} className="h-2" />
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="eta">
            <TabsList>
              <TabsTrigger value="eta">ETA Breaches ({detail!.etaBreachedTasks.length})</TabsTrigger>
              <TabsTrigger value="mistakes">Mistakes / Bugs ({detail!.bugs.length})</TabsTrigger>
              <TabsTrigger value="rework">Rework ({detail!.reworkEvents.length})</TabsTrigger>
              <TabsTrigger value="interventions">
                Interventions ({detail!.interventions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="eta">
              {detail!.etaBreachedTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No ETA breaches — nice work.
                </p>
              ) : (
                <div className="space-y-2">
                  {detail!.etaBreachedTasks.map((task) => (
                    <Link key={task.id} href={ROUTES.TASK(task.id)}>
                      <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="py-3 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {task.project?.name ?? 'No project'} · Due{' '}
                              {task.dueDate ? formatDate(task.dueDate) : '—'}
                              {task.completedAt && ` · Completed ${formatDate(task.completedAt)}`}
                            </p>
                          </div>
                          <TaskStatusBadge status={task.status} />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="mistakes">
              {detail!.bugs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No bugs assigned.
                </p>
              ) : (
                <div className="space-y-2">
                  {detail!.bugs.map((bug) => (
                    <Link key={bug.id} href={ROUTES.BUG(bug.id)}>
                      <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="py-3 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{bug.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {bug.project?.name ?? 'No project'} · Reported{' '}
                              {formatDate(bug.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <BugSeverityBadge severity={bug.severity} />
                            <BugStatusBadge status={bug.status} />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rework">
              {detail!.reworkEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No rework detected — status never moved backward.
                </p>
              ) : (
                <div className="space-y-2">
                  {detail!.reworkEvents.map((event, idx) => (
                    <Link
                      key={`${event.type}-${event.id}-${idx}`}
                      href={event.type === 'task' ? ROUTES.TASK(event.id) : ROUTES.BUG(event.id)}
                    >
                      <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="py-3 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {event.type === 'task' ? 'Task' : 'Bug'} ·{' '}
                              {event.oldValue ?? '—'} → {event.newValue ?? '—'} ·{' '}
                              {formatRelativeTime(event.createdAt)}
                            </p>
                          </div>
                          <Badge
                            className={cn(
                              'border-transparent shrink-0',
                              event.type === 'task'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                            )}
                          >
                            {event.type === 'task' ? 'Task rework' : 'Bug reopened'}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="interventions">
              {detail!.interventions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No interventions logged.
                </p>
              ) : (
                <div className="space-y-2">
                  {detail!.interventions.map((intervention) => (
                    <Card key={intervention.id}>
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between gap-4 mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <UserAvatar user={intervention.manager} size="xs" />
                            <span className="text-sm font-medium truncate">
                              {intervention.manager.name}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatRelativeTime(intervention.createdAt)}
                            </span>
                          </div>
                          {(intervention.task || intervention.bug) && (
                            <Link
                              href={
                                intervention.task
                                  ? ROUTES.TASK(intervention.task.id)
                                  : ROUTES.BUG(intervention.bug!.id)
                              }
                              className="text-xs text-primary hover:underline shrink-0"
                            >
                              {intervention.task ? intervention.task.title : intervention.bug!.title}
                            </Link>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {intervention.note}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
