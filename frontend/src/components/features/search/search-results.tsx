'use client';
import Link from 'next/link';
import { CheckSquare, FolderKanban, SearchX } from 'lucide-react';
import { useSearch } from '@/hooks/use-search';
import { ROUTES } from '@/constants/routes';
import { TaskStatusBadge } from '@/components/shared/status-badge';
import { TaskPriorityBadge } from '@/components/shared/priority-badge';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils/cn';

type SearchType = 'all' | 'task' | 'project' | 'user' | 'team';

interface SearchResultsProps {
  query: string;
  type?: SearchType;
}

function ResultSection({
  title,
  children,
  count,
}: {
  title: string;
  children: React.ReactNode;
  count: number;
}) {
  if (count === 0) return null;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 px-1 mb-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
          {count}
        </span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ResultItem({
  href,
  icon: Icon,
  title,
  subtitle,
  right,
  className,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors group',
        className
      )}
    >
      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0 group-hover:bg-background transition-colors">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </Link>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-6">
      {[3, 2, 2].map((count, sectionIdx) => (
        <div key={sectionIdx} className="space-y-2">
          <Skeleton className="h-3 w-20" />
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="h-8 w-8 rounded-md" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function SearchResults({ query, type = 'all' }: SearchResultsProps) {
  const { data: resp, isLoading, isFetching } = useSearch({
    q: query,
    type: type === 'all' ? undefined : type,
  });

  if (query.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <SearchX className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          Enter at least 2 characters to search
        </p>
      </div>
    );
  }

  if (isLoading || isFetching) {
    return <SearchSkeleton />;
  }

  const data = resp?.data;
  if (!data) return null;

  const tasks = data.tasks ?? [];
  const projects = data.projects ?? [];
  const users = data.users ?? [];
  const totalResults = tasks.length + projects.length + users.length;

  const showTasks = type === 'all' || type === 'task';
  const showProjects = type === 'all' || type === 'project';
  const showMembers = type === 'all' || type === 'user';

  if (totalResults === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <SearchX className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm font-medium">No results found</p>
        <p className="text-xs text-muted-foreground mt-1">
          Try a different search term or adjust the filter
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTasks && tasks.length > 0 && (
        <ResultSection title="Tasks" count={tasks.length}>
          {tasks.map((task) => (
            <ResultItem
              key={task.id}
              href={ROUTES.TASK(task.id)}
              icon={CheckSquare}
              title={task.title}
              subtitle={task.project?.name}
              right={
                <div className="flex items-center gap-1.5">
                  <TaskStatusBadge status={task.status} showIcon={false} />
                </div>
              }
            />
          ))}
        </ResultSection>
      )}

      {showProjects && projects.length > 0 && (
        <ResultSection title="Projects" count={projects.length}>
          {projects.map((project) => (
            <ResultItem
              key={project.id}
              href={ROUTES.PROJECT(project.id)}
              icon={FolderKanban}
              title={project.name}
              subtitle={project.status}
            />
          ))}
        </ResultSection>
      )}

      {showMembers && users.length > 0 && (
        <ResultSection title="Members" count={users.length}>
          {users.map((user) => (
            <Link
              key={user.id}
              href={ROUTES.MEMBER(user.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors"
            >
              <UserAvatar user={user} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </Link>
          ))}
        </ResultSection>
      )}

      <p className="text-xs text-center text-muted-foreground pt-2 pb-1">
        {totalResults} result{totalResults !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
      </p>
    </div>
  );
}
