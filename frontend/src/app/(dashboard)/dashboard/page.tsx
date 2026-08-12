'use client';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { StatsGrid } from '@/components/features/dashboard/stats-grid';
import { TaskStatusChart } from '@/components/features/dashboard/task-status-chart';
import { WeeklyProgressChart } from '@/components/features/dashboard/weekly-progress-chart';
import { ProjectProgressList } from '@/components/features/dashboard/project-progress-list';
import { RecentActivityFeed } from '@/components/features/dashboard/recent-activity-feed';
import { TodayTasksList } from '@/components/features/dashboard/today-tasks-list';
import { UpcomingDeadlines } from '@/components/features/dashboard/upcoming-deadlines';
import { useAuthStore } from '@/stores/auth.store';

export default function DashboardPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const firstName   = currentUser?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${firstName}. Here's what's happening today.`}
      />
      <StatsGrid />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskStatusChart />
        <WeeklyProgressChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProjectProgressList />
          <RecentActivityFeed />
        </div>
        <div className="space-y-6">
          <TodayTasksList />
          <UpcomingDeadlines />
        </div>
      </div>
    </div>
  );
}
