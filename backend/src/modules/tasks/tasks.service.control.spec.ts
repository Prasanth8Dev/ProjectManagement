import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { TasksService } from './tasks.service';

/**
 * Unit tests for the lifecycle-control role gate (`assertCanControlTask`)
 * and its interplay with the transition state machine. Repository/service
 * collaborators are hand-rolled jest mocks — these tests exercise pure
 * business logic, not Prisma or HTTP wiring.
 */
describe('TasksService — task control permissions', () => {
  const baseTask = {
    id: 'task-1',
    status: 'TODO',
    assigneeId: 'assignee-1',
    reporterId: 'reporter-1',
    isPaused: false,
    isBlocked: false,
    title: 'Ship the feature',
  };

  function makeService(overrides: { findByIdResult?: any; userRole?: string } = {}) {
    const task = overrides.findByIdResult ?? baseTask;

    const tasksRepository: any = {
      findById: jest.fn().mockResolvedValue(task),
      update: jest.fn().mockImplementation((id, data) => ({ ...task, ...data })),
      createActivity: jest.fn().mockResolvedValue(undefined),
    };
    const activityService: any = { logActivity: jest.fn() };
    const notificationsService: any = { notify: jest.fn().mockResolvedValue(undefined) };
    const usersService: any = {
      findById: jest.fn().mockResolvedValue(
        overrides.userRole ? { id: 'other-user', role: overrides.userRole } : null,
      ),
    };

    const service = new TasksService(
      tasksRepository,
      activityService,
      notificationsService,
      usersService,
    );

    return { service, tasksRepository, notificationsService, usersService };
  }

  it('lets the assignee start their own task', async () => {
    const { service } = makeService();
    await expect(service.startTask('task-1', 'assignee-1')).resolves.toBeDefined();
  });

  it('lets the reporter act on a task they are not assigned to', async () => {
    const { service } = makeService();
    await expect(service.startTask('task-1', 'reporter-1')).resolves.toBeDefined();
  });

  it('blocks an unrelated user with no elevated role', async () => {
    const { service } = makeService({ userRole: 'DEVELOPER' });
    await expect(service.startTask('task-1', 'random-user')).rejects.toThrow(ForbiddenException);
  });

  it('lets a MANAGER act on a task they neither own nor report', async () => {
    const { service } = makeService({ userRole: 'MANAGER' });
    await expect(service.startTask('task-1', 'random-user')).resolves.toBeDefined();
  });

  it('lets an ADMIN act on any task', async () => {
    const { service } = makeService({ userRole: 'ADMIN' });
    await expect(service.startTask('task-1', 'random-user')).resolves.toBeDefined();
  });

  it('allows system/automated calls with no actor context', async () => {
    const { service } = makeService();
    await expect(service.startTask('task-1', undefined)).resolves.toBeDefined();
  });

  it('still enforces the transition state machine after the role check passes', async () => {
    const { service } = makeService({
      findByIdResult: { ...baseTask, status: 'DONE' },
    });
    // DONE is not a valid state to "start" from — should fail on the
    // transition guard, not the permission check.
    await expect(service.startTask('task-1', 'assignee-1')).rejects.toThrow(BadRequestException);
  });

  it('fires a TASK_BLOCKED notification to the assignee when blocked by someone else', async () => {
    const { service, notificationsService } = makeService({
      userRole: 'MANAGER',
      findByIdResult: { ...baseTask, status: 'IN_PROGRESS' },
    });
    await service.blockTask('task-1', { reason: 'Waiting on API' }, 'manager-1');
    expect(notificationsService.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'assignee-1',
        type: 'TASK_BLOCKED',
        message: 'Waiting on API',
      }),
    );
  });
});
