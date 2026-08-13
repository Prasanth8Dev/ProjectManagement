'use client';
import { cn } from '@/lib/utils/cn';
import type { BugStatus } from '@/types/bug.types';

interface Props {
  status: BugStatus;
  className?: string;
}

const STATUS_CONFIG: Record<BugStatus, { label: string; className: string }> = {
  OPEN: {
    label: 'Open',
    className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  },
  PENDING: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  },
  IN_REVIEW: {
    label: 'In Review',
    className: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
  },
  REOPENED: {
    label: 'Re-opened',
    className: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400',
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
  },
  WONT_FIX: {
    label: "Won't Fix",
    className: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400',
  },
};

export function BugStatusBadge({ status, className }: Props) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.OPEN;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
