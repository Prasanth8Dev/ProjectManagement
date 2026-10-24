import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { MeetingsRepository } from './meetings.repository';
import { TasksService } from '../tasks/tasks.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { CreateMeetingDto, UpdateMeetingDto, UpdateMomDto } from './dto/meeting.dto';
import { CreateActionItemDto, UpdateActionItemDto } from './dto/action-item.dto';

// Roles allowed to manage meetings/MOM/action items they didn't organize —
// e.g. a manager stepping in to fix minutes after the fact.
const MEETING_MANAGE_OVERRIDE_ROLES = ['ADMIN', 'MANAGER', 'PROJECT_MANAGER'];

@Injectable()
export class MeetingsService {
  constructor(
    private readonly meetingsRepository: MeetingsRepository,
    private readonly tasksService: TasksService,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Role check for meeting/MOM/action-item mutations. The meeting's
   * organizer may always manage it; managers/admins/PMs may manage any
   * meeting. Everyone else is blocked. Read endpoints are unaffected.
   */
  private async assertCanManageMeeting(
    meeting: { organizerId: string | null },
    actorUserId?: string,
  ) {
    if (!actorUserId) return; // no actor context (e.g. system/demo calls) — allow
    if (actorUserId === meeting.organizerId) return;

    const actor = await this.usersService.findById(actorUserId).catch(() => null);
    if (actor && MEETING_MANAGE_OVERRIDE_ROLES.includes(actor.role)) return;

    throw new ForbiddenException(
      'Only the meeting organizer or a manager/admin can perform this action.',
    );
  }

  /** Same rule as above, but also lets the action item's own assignee manage it. */
  private async assertCanManageActionItem(
    actionItem: { assigneeId: string | null; meeting: { organizerId: string | null } },
    actorUserId?: string,
  ) {
    if (!actorUserId) return;
    if (actorUserId === actionItem.assigneeId || actorUserId === actionItem.meeting.organizerId) {
      return;
    }

    const actor = await this.usersService.findById(actorUserId).catch(() => null);
    if (actor && MEETING_MANAGE_OVERRIDE_ROLES.includes(actor.role)) return;

    throw new ForbiddenException(
      'Only the assignee, meeting organizer, or a manager/admin can perform this action.',
    );
  }

  async findAllForProject(projectId: string, type?: string) {
    return this.meetingsRepository.findAllForProject(projectId, type);
  }

  async findById(id: string) {
    const meeting = await this.meetingsRepository.findById(id);
    if (!meeting) throw new NotFoundException(`Meeting with id ${id} not found`);
    return meeting;
  }

  async create(projectId: string, dto: CreateMeetingDto, actorUserId?: string) {
    // Default the organizer to whoever's scheduling it, unless they picked
    // someone else — keeps the creator from immediately locking themselves
    // out of editing the meeting they just made.
    return this.meetingsRepository.create({
      projectId,
      title: dto.title,
      type: dto.type,
      scheduledAt: new Date(dto.scheduledAt),
      duration: dto.duration,
      organizerId: dto.organizerId ?? actorUserId,
      description: dto.description,
      participantIds: dto.participantIds,
    });
  }

  async update(id: string, dto: UpdateMeetingDto, actorUserId?: string) {
    const existing = await this.findById(id);
    await this.assertCanManageMeeting(existing, actorUserId);
    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.scheduledAt !== undefined) data.scheduledAt = new Date(dto.scheduledAt);
    if (dto.duration !== undefined) data.duration = dto.duration;
    if (dto.organizerId !== undefined) data.organizerId = dto.organizerId;
    if (dto.description !== undefined) data.description = dto.description;

    const meeting = await this.meetingsRepository.update(id, data as any);

    if (dto.participantIds !== undefined) {
      await this.meetingsRepository.replaceParticipants(id, dto.participantIds);
      return this.findById(id);
    }

    return meeting;
  }

  /** The MOM editor — meeting summary, discussion points, decisions, risks, notes. */
  async updateMom(id: string, dto: UpdateMomDto, actorUserId?: string) {
    const meeting = await this.findById(id);
    await this.assertCanManageMeeting(meeting, actorUserId);
    return this.meetingsRepository.update(id, { ...dto } as any);
  }

  async delete(id: string, actorUserId?: string) {
    const meeting = await this.findById(id);
    await this.assertCanManageMeeting(meeting, actorUserId);
    return this.meetingsRepository.delete(id);
  }

  // --- Action items ---

  async createActionItem(meetingId: string, dto: CreateActionItemDto, actorUserId?: string) {
    const meeting = await this.findById(meetingId);
    await this.assertCanManageMeeting(meeting, actorUserId);
    const actionItem = await this.meetingsRepository.createActionItem({
      meetingId,
      title: dto.title,
      description: dto.description,
      assigneeId: dto.assigneeId,
      priority: dto.priority,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });

    if (dto.assigneeId) {
      await this.notificationsService.notify({
        userId: dto.assigneeId,
        actorId: actorUserId,
        type: 'MOM_ACTION_ITEM_ASSIGNED',
        title: `You were assigned an action item from "${meeting.title}"`,
        link: `/meetings/${meetingId}`,
        meetingId,
        actionItemId: actionItem.id,
      });
    }

    return actionItem;
  }

  async findActionItemById(id: string) {
    const item = await this.meetingsRepository.findActionItemById(id);
    if (!item) throw new NotFoundException(`Action item with id ${id} not found`);
    return item;
  }

  async updateActionItem(id: string, dto: UpdateActionItemDto, actorUserId?: string) {
    const existing = await this.findActionItemById(id);
    await this.assertCanManageActionItem(existing, actorUserId);
    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.dueDate !== undefined) data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.assigneeId !== undefined) data.assigneeId = dto.assigneeId || null;

    const updated = await this.meetingsRepository.updateActionItem(id, data as any);

    if (dto.assigneeId && dto.assigneeId !== existing.assigneeId) {
      await this.notificationsService.notify({
        userId: dto.assigneeId,
        actorId: actorUserId,
        type: 'MOM_ACTION_ITEM_ASSIGNED',
        title: `You were assigned an action item from "${existing.meeting.title}"`,
        link: `/meetings/${existing.meeting.id}`,
        meetingId: existing.meeting.id,
        actionItemId: id,
      });
    }

    return updated;
  }

  async deleteActionItem(id: string, actorUserId?: string) {
    const existing = await this.findActionItemById(id);
    await this.assertCanManageActionItem(existing, actorUserId);
    return this.meetingsRepository.deleteActionItem(id);
  }

  /**
   * Convert an action item into a real project Task. Reuses TasksService.create
   * so the new task goes through the same creation path (position, activity
   * event, notifications) as any other task. Blocked if already converted —
   * the action item keeps its own fields as the source of truth and the task
   * is only ever created once (Meeting -> MOM -> Action Item -> Task).
   */
  async convertToTask(actionItemId: string, actorUserId?: string) {
    const actionItem = await this.findActionItemById(actionItemId);
    await this.assertCanManageActionItem(actionItem, actorUserId);

    if (actionItem.taskId) {
      throw new BadRequestException('This action item has already been converted to a task.');
    }

    const task = await this.tasksService.create(
      {
        title: actionItem.title,
        description: actionItem.description ?? undefined,
        projectId: actionItem.meeting.projectId,
        assigneeId: actionItem.assigneeId ?? undefined,
        priority: actionItem.priority as any,
        dueDate: actionItem.dueDate ? actionItem.dueDate.toISOString().slice(0, 10) : undefined,
      } as any,
      actorUserId,
    );

    return this.meetingsRepository.updateActionItem(actionItemId, {
      taskId: task.id,
      status: 'CONVERTED',
    });
  }

  /** Used by a scheduled/notification pass to nudge people about upcoming due dates. */
  async findActionItemsDueSoon(hoursAhead = 24) {
    return this.meetingsRepository.findActionItemsDueSoon(hoursAhead);
  }
}
