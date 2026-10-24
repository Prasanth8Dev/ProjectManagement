/**
 * Derives all task time-tracking metrics from the immutable TaskActivity
 * event log. Nothing here is stored — durations are always recomputed from
 * the raw events, so they can never drift from what actually happened and
 * can never be hand-edited.
 */

export interface TaskActivityEventLike {
  eventType: string;
  createdAt: Date;
}

export interface TaskTimeTrackingInput {
  assignedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  isPaused: boolean;
  isBlocked: boolean;
  status: string;
}

export interface TaskTimeTracking {
  historicalTrackingUnavailable: boolean;
  assignedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  assignToStartMs: number | null;
  startToCompletionMs: number | null;
  assignToCompletionMs: number | null;
  pausedDurationMs: number;
  blockedDurationMs: number;
  reviewDurationMs: number;
  activeWorkingTimeMs: number | null;
}

function sumPairedIntervals(
  events: TaskActivityEventLike[],
  openType: string,
  closeType: string,
  stillOpen: boolean,
  now: Date,
): number {
  let total = 0;
  let openAt: Date | null = null;
  for (const event of events) {
    if (event.eventType === openType) {
      openAt = event.createdAt;
    } else if (event.eventType === closeType && openAt) {
      total += event.createdAt.getTime() - openAt.getTime();
      openAt = null;
    }
  }
  if (openAt && stillOpen) {
    total += now.getTime() - openAt.getTime();
  }
  return total;
}

export function computeTaskTimeTracking(
  task: TaskTimeTrackingInput,
  eventsAsc: TaskActivityEventLike[],
): TaskTimeTracking {
  const now = new Date();

  const firstEventOfType = (type: string): Date | null =>
    eventsAsc.find((e) => e.eventType === type)?.createdAt ?? null;

  const assignedAt = task.assignedAt ?? firstEventOfType('TASK_ASSIGNED');
  const startedAt = task.startedAt ?? firstEventOfType('TASK_STARTED');
  const completedAt = task.completedAt ?? firstEventOfType('TASK_COMPLETED');

  // No reliable start point — this is a task created before event tracking
  // existed, or one that was never started. Don't fabricate numbers.
  if (!startedAt) {
    return {
      historicalTrackingUnavailable: true,
      assignedAt: assignedAt ? assignedAt.toISOString() : null,
      startedAt: null,
      completedAt: completedAt ? completedAt.toISOString() : null,
      assignToStartMs: null,
      startToCompletionMs: null,
      assignToCompletionMs: null,
      pausedDurationMs: 0,
      blockedDurationMs: 0,
      reviewDurationMs: 0,
      activeWorkingTimeMs: null,
    };
  }

  const assignToStartMs =
    assignedAt && startedAt ? startedAt.getTime() - assignedAt.getTime() : null;
  const startToCompletionMs = completedAt ? completedAt.getTime() - startedAt.getTime() : null;
  const assignToCompletionMs =
    assignedAt && completedAt ? completedAt.getTime() - assignedAt.getTime() : null;

  const pausedDurationMs = sumPairedIntervals(
    eventsAsc,
    'TASK_PAUSED',
    'TASK_RESUMED',
    task.isPaused,
    now,
  );
  const blockedDurationMs = sumPairedIntervals(
    eventsAsc,
    'TASK_BLOCKED',
    'TASK_UNBLOCKED',
    task.isBlocked,
    now,
  );
  const reviewDurationMs = sumPairedIntervals(
    eventsAsc,
    'REVIEW_STARTED',
    'REVIEW_COMPLETED',
    task.status === 'IN_REVIEW',
    now,
  );

  const elapsedMs = (completedAt ?? now).getTime() - startedAt.getTime();
  const activeWorkingTimeMs = Math.max(0, elapsedMs - pausedDurationMs - blockedDurationMs);

  return {
    historicalTrackingUnavailable: false,
    assignedAt: assignedAt ? assignedAt.toISOString() : null,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt ? completedAt.toISOString() : null,
    assignToStartMs,
    startToCompletionMs,
    assignToCompletionMs,
    pausedDurationMs,
    blockedDurationMs,
    reviewDurationMs,
    activeWorkingTimeMs,
  };
}
