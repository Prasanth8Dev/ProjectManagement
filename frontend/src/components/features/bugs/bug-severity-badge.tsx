'use client';
import { cn } from '@/lib/utils/cn';
import type { BugSeverity } from '@/types/bug.types';

interface Props {
  severity: BugSeverity;
  className?: string;
}

const SEVERITY_CONFIG: Record<BugSeverity, { label: string; className: string }> = {
  LOW: {
    label: 'Low',
    className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  HIGH: {
    label: 'High',
    className: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
  },
  CRITICAL: {
    label: 'Critical',
    className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
  },
};

export function BugSeverityBadge({ severity, className }: Props) {
  const config = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.MEDIUM;
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
