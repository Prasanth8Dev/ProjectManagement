import { computeTaskTimeTracking, TaskActivityEventLike, TaskTimeTrackingInput } from './task-time-tracking.util';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function baseTask(overrides: Partial<TaskTimeTrackingInput> = {}): TaskTimeTrackingInput {
  return {
    assignedAt: null,
    startedAt: null,
    completedAt: null,
    isPaused: false,
    isBlocked: false,
    status: 'IN_PROGRESS',
    ...overrides,
  };
}

function event(eventType: string, createdAt: Date): TaskActivityEventLike {
  return { eventType, createdAt };
}

describe('computeTaskTimeTracking', () => {
  it('marks tracking unavailable when the task was never started', () => {
    const result = computeTaskTimeTracking(baseTask({ startedAt: null }), []);
    expect(result.historicalTrackingUnavailable).toBe(true);
    expect(result.activeWorkingTimeMs).toBeNull();
    expect(result.assignToStartMs).toBeNull();
  });

  it('computes assign-to-start delay when both timestamps are present', () => {
    const assignedAt = new Date('2026-01-01T00:00:00Z');
    const startedAt = new Date('2026-01-01T02:00:00Z');
    const result = computeTaskTimeTracking(
      baseTask({ assignedAt, startedAt }),
      [],
    );
    expect(result.historicalTrackingUnavailable).toBe(false);
    expect(result.assignToStartMs).toBe(2 * HOUR);
  });

  it('computes start-to-completion and assign-to-completion durations', () => {
    const assignedAt = new Date('2026-01-01T00:00:00Z');
    const startedAt = new Date('2026-01-01T01:00:00Z');
    const completedAt = new Date('2026-01-02T01:00:00Z');
    const result = computeTaskTimeTracking(
      baseTask({ assignedAt, startedAt, completedAt, status: 'DONE' }),
      [],
    );
    expect(result.startToCompletionMs).toBe(DAY);
    expect(result.assignToCompletionMs).toBe(DAY + HOUR);
  });

  it('sums paused intervals between TASK_PAUSED and TASK_RESUMED events', () => {
    const startedAt = new Date('2026-01-01T00:00:00Z');
    const events = [
      event('TASK_PAUSED', new Date('2026-01-01T01:00:00Z')),
      event('TASK_RESUMED', new Date('2026-01-01T03:00:00Z')),
      event('TASK_PAUSED', new Date('2026-01-01T05:00:00Z')),
      event('TASK_RESUMED', new Date('2026-01-01T05:30:00Z')),
    ];
    const result = computeTaskTimeTracking(baseTask({ startedAt }), events);
    expect(result.pausedDurationMs).toBe(2 * HOUR + 30 * 60 * 1000);
  });

  it('counts a still-open pause interval as ongoing when isPaused is true', () => {
    const startedAt = new Date(Date.now() - 5 * HOUR);
    const pausedAt = new Date(Date.now() - 2 * HOUR);
    const events = [event('TASK_PAUSED', pausedAt)];
    const result = computeTaskTimeTracking(baseTask({ startedAt, isPaused: true }), events);
    // Roughly 2 hours of open pause time (allow slack for test execution time).
    expect(result.pausedDurationMs).toBeGreaterThan(1.9 * HOUR);
    expect(result.pausedDurationMs).toBeLessThan(2.1 * HOUR);
  });

  it('does not count an open pause interval once the task is no longer paused', () => {
    const startedAt = new Date(Date.now() - 5 * HOUR);
    const events = [event('TASK_PAUSED', new Date(Date.now() - 2 * HOUR))];
    const result = computeTaskTimeTracking(baseTask({ startedAt, isPaused: false }), events);
    expect(result.pausedDurationMs).toBe(0);
  });

  it('sums blocked intervals independently of paused intervals', () => {
    const startedAt = new Date('2026-01-01T00:00:00Z');
    const events = [
      event('TASK_BLOCKED', new Date('2026-01-01T01:00:00Z')),
      event('TASK_UNBLOCKED', new Date('2026-01-01T02:00:00Z')),
    ];
    const result = computeTaskTimeTracking(baseTask({ startedAt }), events);
    expect(result.blockedDurationMs).toBe(HOUR);
    expect(result.pausedDurationMs).toBe(0);
  });

  it('subtracts paused and blocked time from active working time', () => {
    const startedAt = new Date('2026-01-01T00:00:00Z');
    const completedAt = new Date('2026-01-02T00:00:00Z'); // 24h elapsed
    const events = [
      event('TASK_PAUSED', new Date('2026-01-01T02:00:00Z')),
      event('TASK_RESUMED', new Date('2026-01-01T04:00:00Z')), // 2h paused
      event('TASK_BLOCKED', new Date('2026-01-01T10:00:00Z')),
      event('TASK_UNBLOCKED', new Date('2026-01-01T13:00:00Z')), // 3h blocked
    ];
    const result = computeTaskTimeTracking(
      baseTask({ startedAt, completedAt, status: 'DONE' }),
      events,
    );
    expect(result.activeWorkingTimeMs).toBe(DAY - 2 * HOUR - 3 * HOUR);
  });

  it('never returns a negative active working time', () => {
    const startedAt = new Date('2026-01-01T00:00:00Z');
    const completedAt = new Date('2026-01-01T01:00:00Z'); // only 1h elapsed
    const events = [
      event('TASK_PAUSED', new Date('2026-01-01T00:00:00Z')),
      event('TASK_RESUMED', new Date('2026-01-01T05:00:00Z')), // 5h paused (overlapping fake data)
    ];
    const result = computeTaskTimeTracking(
      baseTask({ startedAt, completedAt, status: 'DONE' }),
      events,
    );
    expect(result.activeWorkingTimeMs).toBe(0);
  });

  it('falls back to first matching activity events when task fields are missing', () => {
    const events = [
      event('TASK_ASSIGNED', new Date('2026-01-01T00:00:00Z')),
      event('TASK_STARTED', new Date('2026-01-01T01:00:00Z')),
      event('TASK_COMPLETED', new Date('2026-01-01T05:00:00Z')),
    ];
    const result = computeTaskTimeTracking(
      baseTask({ assignedAt: null, startedAt: null, completedAt: null }),
      events,
    );
    expect(result.historicalTrackingUnavailable).toBe(false);
    expect(result.startedAt).toBe(new Date('2026-01-01T01:00:00Z').toISOString());
    expect(result.assignToStartMs).toBe(HOUR);
    expect(result.startToCompletionMs).toBe(4 * HOUR);
  });
});
