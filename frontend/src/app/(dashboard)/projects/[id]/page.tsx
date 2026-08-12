'use client';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';
import { CalendarDays, Users, CheckCircle2, Clock, AlertTriangle, ListTodo } from 'lucide-react';
import { useProject, useProjectStats } from '@/hooks/use-projects';
import { useTasks } from '@/hooks/use-tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ErrorState } from '@/components/ui/error-state';
import { TaskCard } from '@/components/features/tasks/task-card';
import { ActivityFeed } from '@/components/features/activity/activity-feed';
import { ROUTES } from '@/constants/routes';
import { TASK_PRIORITY_CONFIG } from '@/constants/priorities';
import { TASK_STATUS_CONFIG } from '@/constants/task-statuses';
import { cn } from '@/lib/utils/cn';

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

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
        <div className="flex items-center gap-4">
          <div className={cn('p-3 rounded-full', color)}>{icon}</div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const { data: projectResp, isLoading, isError } = useProject(id);
  const { data: statsResp, isLoading: statsLoading } = useProjectStats(id);
  const { data: tasksResp, isLoading: tasksLoading } = useTasks({ projectId: id, limit: 5 });

  const project = projectResp?.data;
  const stats = statsResp?.data;
  const tasks = tasksResp?.data ?? [];

  if (isError) {
    return <ErrorState title="Failed to load project" description="Please try again." />;
  }

  return (
    <div className="space-y-6">
      {/* Project info */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {project?.priority && (
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      PRIORITY_COLORS[project.priority] ?? '',
                    )}
                  >
                    {project.priority}
                  </span>
                )}
              </div>
              {project?.description && (
                <p className="text-muted-foreground">{project.description}</p>
              )}
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                {project?.startDate && (
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4" />
                    <span>Start: {format(new Date(project.startDate), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {project?.endDate && (
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4" />
                    <span>Due: {format(new Date(project.endDate), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              icon={<ListTodo className="w-5 h-5 text-blue-600" />}
              label="Total Tasks"
              value={stats?.totalTasks ?? 0}
              color="bg-blue-50"
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
              label="Completed"
              value={stats?.completedTasks ?? 0}
              color="bg-green-50"
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-yellow-600" />}
              label="In Progress"
              value={stats?.inProgressTasks ?? 0}
              color="bg-yellow-50"
            />
            <StatCard
              icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
              label="Overdue"
              value={stats?.overdueTasks ?? 0}
              color="bg-red-50"
            />
          </>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Tasks</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.PROJECT_TASKS(id)}>View all</Link>
            </Button>
          </div>
          {tasksLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-muted-foreground text-sm">No tasks yet.</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Team members */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Team</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={ROUTES.PROJECT_MEMBERS(id)}>
                    <Users className="w-4 h-4 mr-1" />
                    View all
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="w-9 h-9 rounded-full" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(project?.members ?? []).slice(0, 8).map((m: any) => (
                    <Avatar key={m.user?.id ?? m.id} className="w-9 h-9">
                      <AvatarImage src={m.user?.avatar} alt={m.user?.name} />
                      <AvatarFallback className="text-xs">
                        {(m.user?.name ?? 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {(project?.members?.length ?? 0) === 0 && (
                    <p className="text-sm text-muted-foreground">No members yet.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed projectId={id} limit={5} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
