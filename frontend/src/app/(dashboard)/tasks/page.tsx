'use client';
import { Suspense, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, ListTodo } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/features/tasks/task-card';
import { TaskFormSheet } from '@/components/features/tasks/task-form-sheet';
import { FilterBar } from '@/components/features/tasks/filter-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { useTasks } from '@/hooks/use-tasks';
import { useMembers } from '@/hooks/use-members';
import { useProjects } from '@/hooks/use-projects';
import { useAuthStore } from '@/stores/auth.store';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const PAGE_SIZE = 20;

function AllTasksPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { currentUser } = useAuthStore();

  // URL-synced filters
  const status = searchParams.get('status') ?? undefined;
  const priority = searchParams.get('priority') ?? undefined;
  const projectId = searchParams.get('projectId') ?? undefined;

  // assigneeId has three possible URL states:
  //  - absent entirely  -> nothing chosen yet, default to "my tasks"
  //  - explicit "all"   -> user picked "All assignees", show everything
  //  - a uuid           -> filter to that specific assignee
  const assigneeIdParam = searchParams.get('assigneeId');
  const assigneeId =
    assigneeIdParam === null
      ? currentUser?.id
      : assigneeIdParam === 'all'
        ? undefined
        : assigneeIdParam;

  const page = parseInt(searchParams.get('page') ?? '1', 10);

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      // The filter dropdowns use Radix "__all_x__" sentinel values because
      // Select items can't have an empty value — treat any of those, plus
      // the plain "all", as "clear this filter".
      const isCleared = !value || value === 'all' || /^__all_.+__$/.test(value);

      if (!isCleared) {
        params.set(key, value);
      } else if (key === 'assigneeId') {
        // Write an explicit "all" marker instead of deleting the param so
        // we can tell "user picked All assignees" apart from "no choice
        // made yet" (which defaults to the current user) on next render.
        params.set(key, 'all');
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`?${params.toString()}`);
  };

  const filters = {
    status,
    priority,
    projectId,
    assigneeId,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isError } = useTasks(filters);
  const { data: membersResp } = useMembers();
  const { data: projectsResp } = useProjects();

  const tasks = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const members = membersResp?.data ?? [];
  const projects = projectsResp?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Tasks"
        description={`${total} task${total !== 1 ? 's' : ''} across all projects.`}
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        }
      />

      <FilterBar
        filters={{ status, priority, projectId, assigneeId }}
        onChange={(key, value) => setParam(key, value)}
        members={members}
        projects={projects}
        showProjectFilter
      />

      {isError && (
        <ErrorState
          title="Failed to load tasks"
          description="Something went wrong while fetching tasks."
        />
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {!isLoading && !isError && tasks.length === 0 && (
        <EmptyState
          icon={ListTodo}
          title="No tasks found"
          description="Try adjusting your filters or create a new task."
          action={{ label: 'New Task', onClick: () => setIsCreateOpen(true) }}
        />
      )}

      {!isLoading && !isError && tasks.length > 0 && (
        <>
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(Math.max(1, page - 1))}
                    aria-disabled={page <= 1}
                    className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm text-muted-foreground px-4">
                    Page {page} of {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    aria-disabled={page >= totalPages}
                    className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      <TaskFormSheet open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}

export default function AllTasksPage() {
  return (
    <Suspense>
      <AllTasksPageInner />
    </Suspense>
  );
}
