import { BadRequestException } from '@nestjs/common';

/**
 * Task control state machine. `status` stays the coarse Kanban status
 * (BACKLOG/TODO/IN_PROGRESS/IN_REVIEW/TESTING/DONE/CLOSED/CANCELLED);
 * `isPaused` / `isBlocked` are independent flags so a task can be paused or
 * blocked without leaving the IN_PROGRESS column.
 *
 *   Assigned -> [Start] -> In Progress
 *     In Progress -> [Pause] -> Paused -> [Resume] -> In Progress
 *     In Progress -> [Block] -> Blocked -> [Unblock] -> In Progress
 *     In Progress -> [Complete] -> Done
 *     In Progress | Done -> [Send for Review] -> In Review
 *     In Review -> [Complete Review] -> Done
 *     Done -> [Close] -> Closed
 */

export interface TaskTransitionState {
  status: string;
  assigneeId: string | null;
  isPaused: boolean;
  isBlocked: boolean;
}

type Action =
  | 'start'
  | 'pause'
  | 'resume'
  | 'block'
  | 'unblock'
  | 'complete'
  | 'sendForReview'
  | 'completeReview'
  | 'close';

const CHECKS: Record<Action, (t: TaskTransitionState) => string | null> = {
  start: (t) => {
    if (!['BACKLOG', 'TODO'].includes(t.status)) return `Cannot start a task with status ${t.status}.`;
    if (!t.assigneeId) return 'Assign this task to someone before starting it.';
    return null;
  },
  pause: (t) => {
    if (t.status !== 'IN_PROGRESS') return 'Only an in-progress task can be paused.';
    if (t.isPaused) return 'Task is already paused.';
    if (t.isBlocked) return 'Task is blocked — unblock it first.';
    return null;
  },
  resume: (t) => (t.isPaused ? null : 'Task is not paused.'),
  block: (t) => {
    if (t.status !== 'IN_PROGRESS') return 'Only an in-progress task can be blocked.';
    if (t.isBlocked) return 'Task is already blocked.';
    return null;
  },
  unblock: (t) => (t.isBlocked ? null : 'Task is not blocked.'),
  complete: (t) => {
    if (t.status !== 'IN_PROGRESS') return 'Only an in-progress task can be completed.';
    if (t.isBlocked) return 'Task is blocked — unblock it first.';
    return null;
  },
  sendForReview: (t) =>
    ['IN_PROGRESS', 'DONE'].includes(t.status) ? null : 'Only an in-progress or completed task can be sent for review.',
  completeReview: (t) => (t.status === 'IN_REVIEW' ? null : 'Task is not in review.'),
  close: (t) => (t.status === 'DONE' ? null : 'Only a completed task can be closed.'),
};

export function assertTransition(action: Action, task: TaskTransitionState): void {
  const error = CHECKS[action](task);
  if (error) throw new BadRequestException(error);
}
