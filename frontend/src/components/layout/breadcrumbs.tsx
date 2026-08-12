'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

function formatSegment(segment: string): string {
  // Handle dynamic segments like [id] - just show the raw id
  if (segment.startsWith('[') && segment.endsWith(']')) {
    return segment.slice(1, -1);
  }
  // Convert kebab-case and underscore to title case
  return segment
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Map known path prefixes to readable labels
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  tasks: 'Tasks',
  teams: 'Teams',
  updates: 'Updates',
  reports: 'Reports',
  members: 'Members',
  search: 'Search',
  profile: 'Profile',
  board: 'Board',
  timeline: 'Timeline',
  milestones: 'Milestones',
  settings: 'Settings',
  new: 'New',
  daily: 'Daily',
  weekly: 'Weekly',
  employee: 'Employee',
  project: 'Project',
};

interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumbs() {
  const pathname = usePathname();

  if (!pathname || pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);

  const items: BreadcrumbItem[] = segments.map((segment, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/');
    const label = SEGMENT_LABELS[segment] ?? formatSegment(segment);
    return { label, href };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm min-w-0">
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        aria-label="Home"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={item.href} className="flex items-center gap-1 min-w-0">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            {isLast ? (
              <span
                className="font-medium text-foreground truncate max-w-[160px]"
                title={item.label}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  'text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px]'
                )}
                title={item.label}
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
