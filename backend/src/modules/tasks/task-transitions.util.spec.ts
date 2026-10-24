import { BadRequestException } from '@nestjs/common';
import { assertTransition, TaskTransitionState } from './task-transitions.util';

function makeTask(overrides: Partial<TaskTransitionState> = {}): TaskTransitionState {
  return {
    status: 'TODO',
    assigneeId: 'user-1',
    isPaused: false,
    isBlocked: false,
    ...overrides,
  };
}

describe('assertTransition', () => {
  describe('start', () => {
    it('allows starting a TODO task with an assignee', () => {
      expect(() => assertTransition('start', makeTask({ status: 'TODO' }))).not.toThrow();
    });

    it('allows starting a BACKLOG task with an assignee', () => {
      expect(() => assertTransition('start', makeTask({ status: 'BACKLOG' }))).not.toThrow();
    });

    it('rejects starting an unassigned task', () => {
      expect(() => assertTransition('start', makeTask({ assigneeId: null }))).toThrow(
        BadRequestException,
      );
    });

    it('rejects starting a task that is already in progress', () => {
      expect(() => assertTransition('start', makeTask({ status: 'IN_PROGRESS' }))).toThrow(
        BadRequestException,
      );
    });
  });

  describe('pause / resume', () => {
    it('allows pausing an in-progress task', () => {
      expect(() =>
        assertTransition('pause', makeTask({ status: 'IN_PROGRESS' })),
      ).not.toThrow();
    });

    it('rejects pausing a task that is not in progress', () => {
      expect(() => assertTransition('pause', makeTask({ status: 'TODO' }))).toThrow(
        BadRequestException,
      );
    });

    it('rejects pausing an already-paused task', () => {
      expect(() =>
        assertTransition('pause', makeTask({ status: 'IN_PROGRESS', isPaused: true })),
      ).toThrow(BadRequestException);
    });

    it('rejects pausing a blocked task', () => {
      expect(() =>
        assertTransition('pause', makeTask({ status: 'IN_PROGRESS', isBlocked: true })),
      ).toThrow(BadRequestException);
    });

    it('allows resuming a paused task', () => {
      expect(() =>
        assertTransition('resume', makeTask({ status: 'IN_PROGRESS', isPaused: true })),
      ).not.toThrow();
    });

    it('rejects resuming a task that is not paused', () => {
      expect(() => assertTransition('resume', makeTask({ isPaused: false }))).toThrow(
        BadRequestException,
      );
    });
  });

  describe('block / unblock', () => {
    it('allows blocking an in-progress task', () => {
      expect(() =>
        assertTransition('block', makeTask({ status: 'IN_PROGRESS' })),
      ).not.toThrow();
    });

    it('rejects blocking a task that is not in progress', () => {
      expect(() => assertTransition('block', makeTask({ status: 'DONE' }))).toThrow(
        BadRequestException,
      );
    });

    it('rejects blocking an already-blocked task', () => {
      expect(() =>
        assertTransition('block', makeTask({ status: 'IN_PROGRESS', isBlocked: true })),
      ).toThrow(BadRequestException);
    });

    it('allows unblocking a blocked task', () => {
      expect(() =>
        assertTransition('unblock', makeTask({ status: 'IN_PROGRESS', isBlocked: true })),
      ).not.toThrow();
    });

    it('rejects unblocking a task that is not blocked', () => {
      expect(() => assertTransition('unblock', makeTask({ isBlocked: false }))).toThrow(
        BadRequestException,
      );
    });
  });

  describe('complete', () => {
    it('allows completing an in-progress, unblocked task', () => {
      expect(() =>
        assertTransition('complete', makeTask({ status: 'IN_PROGRESS' })),
      ).not.toThrow();
    });

    it('rejects completing a task that is not in progress', () => {
      expect(() => assertTransition('complete', makeTask({ status: 'TODO' }))).toThrow(
        BadRequestException,
      );
    });

    it('rejects completing a blocked task', () => {
      expect(() =>
        assertTransition('complete', makeTask({ status: 'IN_PROGRESS', isBlocked: true })),
      ).toThrow(BadRequestException);
    });
  });

  describe('sendForReview / completeReview', () => {
    it('allows sending an in-progress task for review', () => {
      expect(() =>
        assertTransition('sendForReview', makeTask({ status: 'IN_PROGRESS' })),
      ).not.toThrow();
    });

    it('allows sending a completed task for review', () => {
      expect(() =>
        assertTransition('sendForReview', makeTask({ status: 'DONE' })),
      ).not.toThrow();
    });

    it('rejects sending a backlog task for review', () => {
      expect(() =>
        assertTransition('sendForReview', makeTask({ status: 'BACKLOG' })),
      ).toThrow(BadRequestException);
    });

    it('allows completing a review that is in progress', () => {
      expect(() =>
        assertTransition('completeReview', makeTask({ status: 'IN_REVIEW' })),
      ).not.toThrow();
    });

    it('rejects completing a review for a task not in review', () => {
      expect(() =>
        assertTransition('completeReview', makeTask({ status: 'IN_PROGRESS' })),
      ).toThrow(BadRequestException);
    });
  });

  describe('close', () => {
    it('allows closing a completed task', () => {
      expect(() => assertTransition('close', makeTask({ status: 'DONE' }))).not.toThrow();
    });

    it('rejects closing a task that is not done', () => {
      expect(() => assertTransition('close', makeTask({ status: 'IN_PROGRESS' }))).toThrow(
        BadRequestException,
      );
    });
  });
});
