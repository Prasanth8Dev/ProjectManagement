'use client';
import { useMemo } from 'react';
import { useBugHistory } from '@/hooks/use-bugs';
import { useBugInterventions } from '@/hooks/use-interventions';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/utils/date';
import { MessageSquareWarning } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { BugHistoryEntry } from '@/types/bug-history.types';
import type { Intervention } from '@/types/intervention.types';

interface BugActivityTimelineProps {
  bugId: string;
}

function formatHistoryMessage(entry: BugHistoryEntry): React.ReactNode {
  const label = (entry.field ?? '').replace(/_/g, ' ');
  switch (entry.field) {
    case 'status':
      return (
        <>
          changed status from{' '}
          <span className="font-medium text-foreground line-through text-xs">{entry.oldValue}</span>{' '}
          to <span className="font-medium text-foreground">{entry.newValue}</span>
        </>
      );
    case 'assignee':
      return entry.newValue ? <span>reassigned this bug</span> : <span>unassigned this bug</span>;
    default:
      if (entry.oldValue && entry.newValue) {
        return (
          <>
            updated <span className="font-medium text-foreground">{label}</span> from{' '}
            <span className="line-through text-xs">{entry.oldValue}</span> to{' '}
            <span className="font-medium text-foreground">{entry.newValue}</span>
          </>
        );
      }
      return <span>updated {label}</span>;
  }
}

interface TimelineEntry {
  id: string;
  createdAt: string;
  actorName: string;
  actorAvatar?: string;
  content: React.ReactNode;
  accent?: 'default' | 'intervention';
}

export function BugActivityTimeline({ bugId }: BugActivityTimelineProps) {
  const { data: history, isLoading: historyLoading } = useBugHistory(bugId);
  const { data: interventions, isLoading: interventionsLoading } = useBugInterventions(bugId);

  const isLoading = historyLoading || interventionsLoading;

  const entries = useMemo<TimelineEntry[]>(() => {
    const historyEntries: TimelineEntry[] = (history ?? []).map((entry) => ({
      id: `history-${entry.id}`,
      createdAt: entry.createdAt,
      actorName: entry.user.name,
      actorAvatar: entry.user.avatar,
      content: formatHistoryMessage(entry),
    }));

    const interventionEntries: TimelineEntry[] = (interventions ?? []).map(
      (intervention: Intervention) => ({
        id: `intervention-${intervention.id}`,
        createdAt: intervention.createdAt,
        actorName: intervention.manager.name,
        actorAvatar: intervention.manager.avatar,
        content: (
          <>
            <span>logged an intervention: </span>
            <span className="text-foreground">&ldquo;{intervention.note}&rdquo;</span>
          </>
        ),
        accent: 'intervention' as const,
      }),
    );

    return [...historyEntries, ...interventionEntries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [history, interventions]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <Skeleton className="h-6 w-6 rounded-full" />
              {i < 3 && <div className="w-px flex-1 bg-border mt-1 min-h-6" />}
            </div>
            <div className="flex-1 pb-4 space-y-1">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">No activity yet.</p>;
  }

  return (
    <div className="space-y-0">
      {entries.map((entry, idx) => {
        const isLast = idx === entries.length - 1;
        const isIntervention = entry.accent === 'intervention';
        return (
          <div key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              {isIntervention ? (
                <div className="h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquareWarning className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                </div>
              ) : (
                <UserAvatar
                  user={{ name: entry.actorName, avatar: entry.actorAvatar }}
                  size="xs"
                  className="shrink-0 mt-0.5"
                />
              )}
              {!isLast && <div className="w-px flex-1 bg-border mt-1 min-h-6" />}
            </div>

            <div className={cn('flex-1 pb-4', isLast && 'pb-0')}>
              <p className="text-sm leading-snug">
                <span className="font-medium">{entry.actorName}</span>{' '}
                <span className="text-muted-foreground">{entry.content}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatRelativeTime(entry.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
