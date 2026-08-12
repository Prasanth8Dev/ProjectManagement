'use client';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { useProject } from '@/hooks/use-projects';
import { ROUTES } from '@/constants/routes';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const tabs = [
  { label: 'Overview', href: (id: string) => ROUTES.PROJECT(id) },
  { label: 'Board', href: (id: string) => ROUTES.PROJECT_BOARD(id) },
  { label: 'Tasks', href: (id: string) => ROUTES.PROJECT_TASKS(id) },
  { label: 'Timeline', href: (id: string) => ROUTES.PROJECT_TIMELINE(id) },
  { label: 'Milestones', href: (id: string) => ROUTES.PROJECT_MILESTONES(id) },
  { label: 'Members', href: (id: string) => ROUTES.PROJECT_MEMBERS(id) },
  { label: 'Settings', href: (id: string) => ROUTES.PROJECT_SETTINGS(id) },
];

const STATUS_COLORS: Record<string, string> = {
  PLANNING: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const { data: projectResp, isLoading } = useProject(id);
  const project = projectResp?.data;

  return (
    <div className="space-y-0">
      {/* Project header */}
      <div className="mb-0 pb-0">
        <div className="flex items-center gap-3 mb-4">
          {isLoading ? (
            <>
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-8 w-48" />
            </>
          ) : (
            <>
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: project?.color || '#6366f1' }}
              />
              <h1 className="text-2xl font-bold truncate">{project?.name || '—'}</h1>
              {project?.status && (
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    STATUS_COLORS[project.status] ?? 'bg-gray-100 text-gray-800',
                  )}
                >
                  {project.status.replace('_', ' ')}
                </span>
              )}
            </>
          )}
        </div>

        {/* Tab navigation */}
        <div className="border-b">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const href = tab.href(id);
              const isActive = pathname === href;
              return (
                <Link
                  key={tab.label}
                  href={href}
                  className={cn(
                    'px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="pt-6">{children}</div>
    </div>
  );
}
