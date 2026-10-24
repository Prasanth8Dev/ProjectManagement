import { ForbiddenException } from '@nestjs/common';
import { MeetingsService } from './meetings.service';

/**
 * Unit tests for the meeting/MOM/action-item management role gate. Mirrors
 * the task-control permission tests: organizer/assignee always allowed,
 * manager-tier roles allowed on anything, everyone else blocked.
 */
describe('MeetingsService — manage permissions', () => {
  const meeting = {
    id: 'meeting-1',
    title: 'Sprint Planning',
    projectId: 'project-1',
    organizerId: 'organizer-1',
  };

  const actionItem = {
    id: 'action-item-1',
    title: 'Fix the flaky test',
    assigneeId: 'assignee-1',
    taskId: null,
    meeting: { id: meeting.id, title: meeting.title, organizerId: meeting.organizerId },
  };

  function makeService(overrides: { userRole?: string } = {}) {
    const meetingsRepository: any = {
      findById: jest.fn().mockResolvedValue(meeting),
      findActionItemById: jest.fn().mockResolvedValue(actionItem),
      update: jest.fn().mockResolvedValue(meeting),
      updateActionItem: jest.fn().mockImplementation((id, data) => ({ ...actionItem, ...data })),
      deleteActionItem: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const tasksService: any = { create: jest.fn() };
    const notificationsService: any = { notify: jest.fn().mockResolvedValue(undefined) };
    const usersService: any = {
      findById: jest.fn().mockResolvedValue(
        overrides.userRole ? { id: 'other-user', role: overrides.userRole } : null,
      ),
    };

    const service = new MeetingsService(
      meetingsRepository,
      tasksService,
      notificationsService,
      usersService,
    );

    return { service, meetingsRepository };
  }

  it('lets the organizer update their own meeting', async () => {
    const { service } = makeService();
    await expect(
      service.update('meeting-1', { title: 'Renamed' }, 'organizer-1'),
    ).resolves.toBeDefined();
  });

  it('blocks an unrelated user with no elevated role from updating a meeting', async () => {
    const { service } = makeService({ userRole: 'DEVELOPER' });
    await expect(
      service.update('meeting-1', { title: 'Renamed' }, 'random-user'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('lets a MANAGER edit a meeting they did not organize', async () => {
    const { service } = makeService({ userRole: 'MANAGER' });
    await expect(
      service.update('meeting-1', { title: 'Renamed' }, 'random-user'),
    ).resolves.toBeDefined();
  });

  it('allows system/automated calls with no actor context', async () => {
    const { service } = makeService();
    await expect(service.delete('meeting-1', undefined)).resolves.toBeUndefined();
  });

  it('lets the action item assignee update it', async () => {
    const { service } = makeService();
    await expect(
      service.updateActionItem('action-item-1', { status: 'IN_PROGRESS' }, 'assignee-1'),
    ).resolves.toBeDefined();
  });

  it('blocks an unrelated user from deleting someone else’s action item', async () => {
    const { service } = makeService({ userRole: 'DEVELOPER' });
    await expect(service.deleteActionItem('action-item-1', 'random-user')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('lets the meeting organizer manage an action item they are not assigned to', async () => {
    const { service } = makeService();
    await expect(
      service.deleteActionItem('action-item-1', 'organizer-1'),
    ).resolves.toBeUndefined();
  });
});
