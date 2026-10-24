/**
 * Rework is auto-detected from status history: whenever a task or bug's
 * status moves backward after having reached a more advanced stage (e.g.
 * DONE -> IN_PROGRESS), or a bug is explicitly REOPENED, that transition
 * counts as one "rework event" against whoever made the change.
 */

export const TASK_STAGE_ORDER: Record<string, number> = {
  BACKLOG: 0,
  TODO: 1,
  IN_PROGRESS: 2,
  IN_REVIEW: 3,
  TESTING: 4,
  DONE: 5,
  // CANCELLED intentionally excluded — cancelling isn't "rework"
};

export const BUG_STAGE_ORDER: Record<string, number> = {
  OPEN: 0,
  IN_PROGRESS: 1,
  PENDING: 1,
  IN_REVIEW: 2,
  TESTING: 3,
  RESOLVED: 4,
  CLOSED: 5,
  // REOPENED and WONT_FIX intentionally excluded from ordering — REOPENED
  // is always treated as rework below, WONT_FIX is a terminal decision
};

export interface ReworkEvent {
  type: 'task' | 'bug';
  id: string;
  title: string;
  userId: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date;
}

interface StatusHistoryRow {
  taskId?: string;
  bugId?: string;
  userId: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date;
}

interface TaskEventRow {
  taskId: string;
  userId: string;
  eventType: string;
  previousValue: string | null;
  newValue: string | null;
  createdAt: Date;
}

export function detectTaskRework(
  history: TaskEventRow[],
  titleById: Record<string, string>,
): ReworkEvent[] {
  const events: ReworkEvent[] = [];
  for (const row of history) {
    if (row.eventType !== 'STATUS_CHANGED' || !row.taskId) continue;
    const from = row.previousValue ? TASK_STAGE_ORDER[row.previousValue] : undefined;
    const to = row.newValue ? TASK_STAGE_ORDER[row.newValue] : undefined;
    if (from === undefined || to === undefined) continue;
    if (to < from) {
      events.push({
        type: 'task',
        id: row.taskId,
        title: titleById[row.taskId] ?? 'Untitled task',
        userId: row.userId,
        oldValue: row.previousValue,
        newValue: row.newValue,
        createdAt: row.createdAt,
      });
    }
  }
  return events;
}

export function detectBugRework(
  history: StatusHistoryRow[],
  titleById: Record<string, string>,
): ReworkEvent[] {
  const events: ReworkEvent[] = [];
  for (const row of history) {
    if (row.field !== 'status' || !row.bugId) continue;
    if (row.newValue === 'REOPENED') {
      events.push({
        type: 'bug',
        id: row.bugId,
        title: titleById[row.bugId] ?? 'Untitled bug',
        userId: row.userId,
        oldValue: row.oldValue,
        newValue: row.newValue,
        createdAt: row.createdAt,
      });
      continue;
    }
    const from = row.oldValue ? BUG_STAGE_ORDER[row.oldValue] : undefined;
    const to = row.newValue ? BUG_STAGE_ORDER[row.newValue] : undefined;
    if (from === undefined || to === undefined) continue;
    if (to < from) {
      events.push({
        type: 'bug',
        id: row.bugId,
        title: titleById[row.bugId] ?? 'Untitled bug',
        userId: row.userId,
        oldValue: row.oldValue,
        newValue: row.newValue,
        createdAt: row.createdAt,
      });
    }
  }
  return events;
}
