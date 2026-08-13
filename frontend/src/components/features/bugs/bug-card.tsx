'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarDays, Bug as BugIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { UserAvatar } from '@/components/shared/user-avatar';
import { BugSeverityBadge } from './bug-severity-badge';
import { BugStatusBadge } from './bug-status-badge';
import { BugPlatformBadge } from './bug-platform-badge';
import type { Bug } from '@/types/bug.types';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

const SEVERITY_BORDER: Record<string, string> = {
  LOW: 'border-l-blue-400',
  MEDIUM: 'border-l-yellow-400',
  HIGH: 'border-l-orange-500',
  CRITICAL: 'border-l-red-500',
};

interface BugCardProps {
  bug: Bug;
  onClick?: () => void;
  className?: string;
}

export function BugCard({ bug, onClick, className }: BugCardProps) {
  const content = (
    <motion.div whileHover={{ scale: 1.01, y: -1 }} transition={{ duration: 0.15 }}>
      <Card
        className={cn(
          'cursor-pointer border-l-4 hover:shadow-md transition-shadow',
          SEVERITY_BORDER[bug.severity] ?? 'border-l-muted',
          className
        )}
        onClick={onClick}
      >
        <CardContent className="p-4 space-y-3">
          {/* Title row */}
          <div className="flex items-start gap-2">
            <BugIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <h3 className="text-sm font-medium line-clamp-2 flex-1 leading-snug">
              {bug.title}
            </h3>
          </div>

          {/* Project tag */}
          {bug.project && (
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: bug.project.color ?? '#6366f1' }}
              />
              <span className="text-xs text-muted-foreground truncate">
                {bug.project.name}
              </span>
            </div>
          )}

          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <BugStatusBadge status={bug.status} />
            <BugSeverityBadge severity={bug.severity} />
            {bug.platform && <BugPlatformBadge platform={bug.platform} />}
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(bug.createdAt, 'MMM d, yyyy')}
            </div>
            <div className="flex items-center gap-1.5">
              {bug.reporter && (
                <UserAvatar user={bug.reporter as any} size="xs" showTooltip />
              )}
              {bug.assignee && (
                <UserAvatar user={bug.assignee as any} size="xs" showTooltip />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (onClick) return content;
  return <Link href={ROUTES.BUG(bug.id)}>{content}</Link>;
}
