'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/features/tasks/task-card';
import { TaskFormSheet } from '@/components/features/tasks/task-form-sheet';
import { FilterBar } from '@/components/features/tasks/filter-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { useTasks } from '@/hooks/use-tasks';
import { useProjectMembers } from '@/hooks/use-projects';
import { ListTodo } from 'lucide-react';

export default function ProjectTasksPage() {
  const { id } = useParams<{ id: string }>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filters, setFilters] = useState<{
    status?: string;
    priority?: string;
    assigneeId?: string;
  }>({});

  const { data, isLoading, isError } = useTasks({
    projectId: id,
    ...filters,
  });

  const { data: membersResp } = useProjectMembers(id);
  const tasks = data?.data ?? [];
  const members = (membersResp ?? []).map((m: any) => m.user);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="All tasks in this project."
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        }
      />

      <FilterBar
        filters={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value || undefined }))}
        members={members}
        showProjectFilter={false}
      />

      {isError && (
        <ErrorState
          title="Failed to load tasks"
          description="Something went wrong while fetching tasks."
        />
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {!isLoading && !isError && tasks.length === 0 && (
        <EmptyState
          icon={ListTodo}
          title="No tasks found"
          description="Create the first task for this project."
          action={{ label: 'New Task', onClick: () => setIsCreateOpen(true) }}
        />
      )}

      {!isLoading && !isError && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      <TaskFormSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        defaultProjectId={id}
      />
    </div>
  );
}
