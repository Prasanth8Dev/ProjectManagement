'use client';
import { Clock, PlayCircle, PauseCircle, Octagon, Eye, CheckCircle2, UserPlus } from 'lucide-react';
import { useTaskTimeTracking } from '@/hooks/use-tasks';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime, formatDuration } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

interface TaskTimeTrackingCardProps {
  taskId: string;
}

function Row({
  icon: Icon,
  label,
  value,
  iconClass,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={cn('h-4 w-4', iconClass)} />
        {label}
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function TaskTimeTrackingCard({ taskId }: TaskTimeTrackingCardProps) {
  const { data, isLoading } = useTaskTimeTracking(taskId);

  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.historicalTrackingUnavailable) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Historical tracking unavailable
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {data.assignedAt && (
        <Row
          icon={UserPlus}
          label="Assigned"
          value={formatDateTime(data.assignedAt)}
          iconClass="text-indigo-500"
        />
      )}
      <Row
        icon={PlayCircle}
        label="Started"
        value={data.startedAt ? formatDateTime(data.startedAt) : '—'}
        iconClass="text-green-500"
      />
      <Row
        icon={Clock}
        label="Active Time"
        value={formatDuration(data.activeWorkingTimeMs)}
        iconClass="text-primary"
      />
      {data.pausedDurationMs > 0 && (
        <Row
          icon={PauseCircle}
          label="Paused"
          value={formatDuration(data.pausedDurationMs)}
          iconClass="text-amber-500"
        />
      )}
      {data.blockedDurationMs > 0 && (
        <Row
          icon={Octagon}
          label="Blocked"
          value={formatDuration(data.blockedDurationMs)}
          iconClass="text-red-500"
        />
      )}
      {data.reviewDurationMs > 0 && (
        <Row
          icon={Eye}
          label="In Review"
          value={formatDuration(data.reviewDurationMs)}
          iconClass="text-purple-500"
        />
      )}
      {data.completedAt && (
        <Row
          icon={CheckCircle2}
          label="Completed"
          value={formatDateTime(data.completedAt)}
          iconClass="text-green-600"
        />
      )}
    </div>
  );
}
