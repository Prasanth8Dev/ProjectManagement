'use client';
import {
  FolderKanban,
  Activity,
  CheckSquare,
  CheckCircle2,
  Clock,
  Users,
} from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsGrid() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const stats = data ?? {
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    totalMembers: 0,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        title="Total Projects"
        value={stats.totalProjects}
        icon={FolderKanban}
        color="text-blue-500"
      />
      <StatCard
        title="Active Projects"
        value={stats.activeProjects}
        icon={Activity}
        color="text-green-500"
      />
      <StatCard
        title="Total Tasks"
        value={stats.totalTasks}
        icon={CheckSquare}
        color="text-purple-500"
      />
      <StatCard
        title="Completed Tasks"
        value={stats.completedTasks}
        icon={CheckCircle2}
        color="text-emerald-500"
      />
      <StatCard
        title="In Progress"
        value={stats.inProgressTasks}
        icon={Clock}
        color="text-yellow-500"
      />
      <StatCard
        title="Team Members"
        value={stats.totalMembers}
        icon={Users}
        color="text-indigo-500"
      />
    </div>
  );
}
