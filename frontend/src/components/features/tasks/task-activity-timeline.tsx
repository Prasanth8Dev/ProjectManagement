'use client';
import { useMemo } from 'react';
import {
  PlayCircle,
  PauseCircle,
  Octagon,
  CheckCircle2,
  Eye,
  Lock,
  UserPlus,
  MessageSquare,
  ArrowRightLeft,
  Flag,
  CalendarClock,
  Sparkles,
  XCircle,
  MessageSquareWarning,
  type LucideIcon,
} from 'lucide-react';
import { useTaskHistory } from '@/hooks/use-tasks';
import { useTaskInterventions } from '@/hooks/use-interventions';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime, formatDateTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import type { TaskActivityEvent, TaskEventType } from '@/types/task.types';
import type { Intervention } from '@/types/intervention.types';

interface TaskActivityTimelineProps {
  taskId: string;
}

const EVENT_CONFIG: Record<
  TaskEventType,
  { icon: LucideIcon; label: string; iconClass: string; bgClass: string }
> = {
  TASK_CREATED: { icon: Sparkles, label: 'created this task', iconClass: 'text-blue-600 dark:text-blue-400', bgClass: 'bg-blue-100 dark:bg-blue-900/30' },
  TASK_ASSIGNED: { icon: UserPlus, label: 'assigned this task', iconClass: 'text-indigo-600 dark:text-indigo-400', bgClass: 'bg-indigo-100 dark:bg-indigo-900/30' },
  TASK_REASSIGNED: { icon: ArrowRightLeft, label: 'reassigned this task', iconClass: 'text-indigo-600 dark:text-indigo-400', bgClass: 'bg-indigo-100 dark:bg-indigo-900/30' },
  TASK_STARTED: { icon: PlayCircle, label: 'started development', iconClass: 'text-green-600 dark:text-green-400', bgClass: 'bg-green-100 dark:bg-green-900/30' },
  TASK_PAUSED: { icon: PauseCircle, label: 'paused the task', iconClass: 'text-amber-600 dark:text-amber-400', bgClass: 'bg-amber-100 dark:bg-amber-900/30' },
  TASK_RESUMED: { icon: PlayCircle, label: 'resumed the task', iconClass: 'text-green-600 dark:text-green-400', bgClass: 'bg-green-100 dark:bg-green-900/30' },
  TASK_BLOCKED: { icon: Octagon, label: 'marked this task as blocked', iconClass: 'text-red-600 dark:text-red-400', bgClass: 'bg-red-100 dark:bg-red-900/30' },
  TASK_UNBLOCKED: { icon: Octagon, label: 'unblocked this task', iconClass: 'text-green-600 dark:text-green-400', bgClass: 'bg-green-100 dark:bg-green-900/30' },
  TASK_COMPLETED: { icon: CheckCircle2, label: 'completed this task', iconClass: 'text-green-600 dark:text-green-400', bgClass: 'bg-green-100 dark:bg-green-900/30' },
  REVIEW_STARTED: { icon: Eye, label: 'sent this task for review', iconClass: 'text-purple-600 dark:text-purple-400', bgClass: 'bg-purple-100 dark:bg-purple-900/30' },
  REVIEW_COMPLETED: { icon: Eye, label: 'completed the review', iconClass: 'text-purple-600 dark:text-purple-400', bgClass: 'bg-purple-100 dark:bg-purple-900/30' },
  TASK_CLOSED: { icon: Lock, label: 'closed this task', iconClass: 'text-slate-600 dark:text-slate-400', bgClass: 'bg-slate-200 dark:bg-slate-800' },
  COMMENT_ADDED: { icon: MessageSquare, label: 'commented on this task', iconClass: 'text-sky-600 dark:text-sky-400', bgClass: 'bg-sky-100 dark:bg-sky-900/30' },
  STATUS_CHANGED: { icon: Flag, label: 'changed the status', iconClass: 'text-yellow-600 dark:text-yellow-400', bgClass: 'bg-yellow-100 dark:bg-yellow-900/30' },
  PRIORITY_CHANGED: { icon: Flag, label: 'changed the priority', iconClass: 'text-orange-600 dark:text-orange-400', bgClass: 'bg-orange-100 dark:bg-orange-900/30' },
  ETA_CHANGED: { icon: CalendarClock, label: 'changed the ETA', iconClass: 'text-cyan-600 dark:text-cyan-400', bgClass: 'bg-cyan-100 dark:bg-cyan-900/30' },
};

function eventMessage(event: TaskActivityEvent): React.ReactNode {
  const config = EVENT_CONFIG[event.eventType];
  const hasValues = event.previousValue && event.newValue;

  if (hasValues && (event.eventType === 'STATUS_CHANGED' || event.eventType === 'PRIORITY_CHANGED')) {
    return (
      <>
        {config.label.replace(/^changed the /, 'changed ')} from{' '}
        <span className="line-through text-xs text-muted-foreground">{event.previousValue}</span>{' '}
        to <span className="font-medium text-foreground">{event.newValue}</span>
      </>
    );
  }

  if (event.eventType === 'ETA_CHANGED') {
    return (
      <>
        {config.label} to{' '}
        <span className="font-medium text-foreground">
          {event.newValue ? formatDateTime(event.newValue) : 'none'}
        </span>
      </>
    );
  }

  return <span>{config.label}</span>;
}

interface TimelineEntry {
  id: string;
  createdAt: string;
  actorName: string;
  actorAvatar?: string;
  icon: LucideIcon;
  iconClass: string;
  bgClass: string;
  content: React.ReactNode;
  detail?: string | null;
}

export function TaskActivityTimeline({ taskId }: TaskActivityTimelineProps) {
  const { data: events, isLoading: eventsLoading } = useTaskHistory(taskId);
  const { data: interventions, isLoading: interventionsLoading } = useTaskInterventions(taskId);

  const isLoading = eventsLoading || interventionsLoading;

  const entries = useMemo<TimelineEntry[]>(() => {
    const eventEntries: TimelineEntry[] = (events ?? []).map((event) => {
      const config = EVENT_CONFIG[event.eventType] ?? EVENT_CONFIG.STATUS_CHANGED;
      return {
        id: `event-${event.id}`,
        createdAt: event.createdAt,
        actorName: event.user?.name ?? 'System',
        actorAvatar: event.user?.avatar ?? undefined,
        icon: config.icon,
        iconClass: config.iconClass,
        bgClass: config.bgClass,
        content: eventMessage(event),
        detail: event.reason ?? event.comment ?? null,
      };
    });

    const interventionEntries: TimelineEntry[] = (interventions ?? []).map(
      (intervention: Intervention) => ({
        id: `intervention-${intervention.id}`,
        createdAt: intervention.createdAt,
        actorName: intervention.manager.name,
        actorAvatar: intervention.manager.avatar,
        icon: MessageSquareWarning,
        iconClass: 'text-purple-600 dark:text-purple-400',
        bgClass: 'bg-purple-100 dark:bg-purple-900/30',
        content: <span>logged an intervention</span>,
        detail: intervention.note,
      }),
    );

    return [...eventEntries, ...interventionEntries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [events, interventions]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <Skeleton className="h-7 w-7 rounded-full" />
              {i < 4 && <div className="w-px flex-1 bg-border mt-1 min-h-6" />}
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
        const Icon = entry.icon;
        return (
          <div key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'h-7 w-7 rounded-full flex items-center justify-center shrink-0 ring-4 ring-background',
                  entry.bgClass,
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', entry.iconClass)} />
              </div>
              {!isLast && <div className="w-px flex-1 bg-border mt-1 min-h-6" />}
            </div>

            <div className={cn('flex-1 pb-5', isLast && 'pb-0')}>
              <div className="flex items-center gap-1.5 flex-wrap text-sm leading-snug">
                <UserAvatar user={{ name: entry.actorName, avatar: entry.actorAvatar }} size="xs" />
                <span className="font-medium">{entry.actorName}</span>
                <span className="text-muted-foreground">{entry.content}</span>
              </div>
              {entry.detail && (
                <p className="text-xs text-muted-foreground mt-1 pl-6 italic">
                  &ldquo;{entry.detail}&rdquo;
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1 pl-6">
                {formatRelativeTime(entry.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
