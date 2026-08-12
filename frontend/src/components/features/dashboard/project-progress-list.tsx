'use client';
import Link from 'next/link';
import { useDashboardCharts } from '@/hooks/use-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils/cn';

export function ProjectProgressList() {
  const { data, isLoading } = useDashboardCharts();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3.5 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const projects = data?.projectProgress ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Project Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No projects to show
          </p>
        ) : (
          <ul className="space-y-4">
            {projects.map((project) => {
              const pid = project.projectId ?? project.id ?? project.name;
              const done = project.completedTasks ?? project.completed ?? 0;
              const total = project.totalTasks ?? project.total ?? 0;
              const pct = project.percentage ?? project.percent ?? 0;
              return (
              <li key={pid} className="space-y-1.5 group">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={ROUTES.PROJECT(pid as string)}
                    className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="text-sm font-medium truncate">
                      {project.name}
                    </span>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                    <span>{done}/{total}</span>
                    <span
                      className={cn(
                        'font-semibold tabular-nums',
                        pct >= 100
                          ? 'text-green-600 dark:text-green-400'
                          : pct >= 50
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      )}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={pct}
                  className="h-1.5"
                  style={{ '--progress-foreground': project.color } as React.CSSProperties}
                />
              </li>
            );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
