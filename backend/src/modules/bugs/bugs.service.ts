import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BugsRepository } from './bugs.repository';
import { CreateBugDto } from './dto/create-bug.dto';
import { UpdateBugDto } from './dto/update-bug.dto';
import { BugFilterDto, AssignBugDto, ChangeBugStatusDto } from './dto/bug-filter.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { NotificationsService } from '../notifications/notifications.service';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class BugsService {
  constructor(
    private readonly bugsRepository: BugsRepository,
    private readonly notificationsService: NotificationsService,
    private readonly tasksService: TasksService,
  ) {}

  async findAll(filterDto: BugFilterDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      severity,
      priority,
      platform,
      projectId,
      assigneeId,
      reporterId,
      isArchived,
      sortBy,
      sortOrder,
    } = filterDto;

    const { bugs, total } = await this.bugsRepository.findAll({
      page,
      limit,
      search,
      status,
      severity,
      priority,
      platform,
      projectId,
      assigneeId,
      reporterId,
      isArchived,
      sortBy,
      sortOrder,
    });

    return createPaginatedResponse(bugs, total, page, limit);
  }

  async findById(id: string) {
    const bug = await this.bugsRepository.findById(id);
    if (!bug) throw new NotFoundException(`Bug with id ${id} not found`);
    return bug;
  }

  async create(dto: CreateBugDto, actorUserId?: string) {
    const bug = await this.bugsRepository.create({
      title: dto.title,
      description: dto.description,
      stepsToReproduce: dto.stepsToReproduce,
      expectedBehavior: dto.expectedBehavior,
      actualBehavior: dto.actualBehavior,
      environment: dto.environment,
      status: dto.status ?? 'OPEN',
      severity: dto.severity ?? 'MEDIUM',
      priority: dto.priority ?? 'MEDIUM',
      platform: dto.platform,
      reporter: { connect: { id: dto.reporterId } },
      ...(dto.projectId && { project: { connect: { id: dto.projectId } } }),
      ...(dto.assigneeId && { assignee: { connect: { id: dto.assigneeId } } }),
    });

    if (dto.assigneeId) {
      await this.notificationsService.notify({
        userId: dto.assigneeId,
        actorId: actorUserId ?? dto.reporterId,
        type: 'BUG_ASSIGNED',
        title: `You were assigned to bug "${bug.title}"`,
        link: `/bugs/${bug.id}`,
        bugId: bug.id,
      });
    }

    return bug;
  }

  async update(id: string, dto: UpdateBugDto, actorUserId?: string) {
    const existing = await this.findById(id);
    const data: Record<string, unknown> = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.stepsToReproduce !== undefined) data.stepsToReproduce = dto.stepsToReproduce;
    if (dto.expectedBehavior !== undefined) data.expectedBehavior = dto.expectedBehavior;
    if (dto.actualBehavior !== undefined) data.actualBehavior = dto.actualBehavior;
    if (dto.environment !== undefined) data.environment = dto.environment;
    if (dto.severity !== undefined) data.severity = dto.severity;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.platform !== undefined) data.platform = dto.platform;
    if (dto.isArchived !== undefined) data.isArchived = dto.isArchived;
    if (dto.projectId !== undefined) data.projectId = dto.projectId ?? null;
    if (dto.assigneeId !== undefined) data.assigneeId = dto.assigneeId ?? null;
    if (dto.linkedTaskId !== undefined) data.linkedTaskId = dto.linkedTaskId ?? null;

    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === 'RESOLVED') {
        data.resolvedAt = new Date();
      } else if (dto.status === 'CLOSED' || dto.status === 'WONT_FIX') {
        data.closedAt = new Date();
      } else if (dto.status === 'REOPENED' || dto.status === 'OPEN') {
        // Going back to an open state clears any prior resolution/closure timestamps.
        data.resolvedAt = null;
        data.closedAt = null;
      }
    }

    const updated = await this.bugsRepository.update(id, data as any);

    if (
      dto.assigneeId !== undefined &&
      dto.assigneeId &&
      dto.assigneeId !== existing.assigneeId
    ) {
      await this.notificationsService.notify({
        userId: dto.assigneeId,
        actorId: actorUserId,
        type: 'BUG_ASSIGNED',
        title: `You were assigned to bug "${existing.title}"`,
        link: `/bugs/${id}`,
        bugId: id,
      });
    }

    return updated;
  }

  async delete(id: string) {
    await this.findById(id);
    return this.bugsRepository.delete(id);
  }

  async assign(id: string, dto: AssignBugDto, actorUserId?: string) {
    const existing = await this.findById(id);
    const updated = await this.bugsRepository.update(id, { assigneeId: dto.assigneeId ?? null } as any);

    if (dto.assigneeId && dto.assigneeId !== existing.assigneeId) {
      await this.notificationsService.notify({
        userId: dto.assigneeId,
        actorId: actorUserId,
        type: 'BUG_ASSIGNED',
        title: `You were assigned to bug "${existing.title}"`,
        link: `/bugs/${id}`,
        bugId: id,
      });
    }

    return updated;
  }

  async changeStatus(id: string, dto: ChangeBugStatusDto, actorUserId?: string) {
    await this.findById(id);
    const data: Record<string, unknown> = { status: dto.status };
    if (dto.status === 'RESOLVED') data.resolvedAt = new Date();
    if (dto.status === 'CLOSED' || dto.status === 'WONT_FIX') data.closedAt = new Date();
    if (dto.status === 'REOPENED' || dto.status === 'OPEN') {
      data.resolvedAt = null;
      data.closedAt = null;
    }
    return this.bugsRepository.update(id, data as any);
  }

  /**
   * Create a new Task pre-filled from this bug's details, and link the two
   * together. The bug keeps existing (and keeps its own status/history) —
   * this just gives you a Task to track the fix alongside it.
   */
  async convertToTask(id: string, actorUserId?: string) {
    const bug = await this.findById(id);

    if (bug.linkedTaskId) {
      throw new BadRequestException('This bug is already linked to a task.');
    }
    if (!bug.projectId) {
      throw new BadRequestException(
        'This bug must belong to a project before it can be converted to a task.',
      );
    }

    const descriptionParts = [
      bug.description,
      bug.stepsToReproduce ? `Steps to reproduce:\n${bug.stepsToReproduce}` : null,
      bug.expectedBehavior ? `Expected: ${bug.expectedBehavior}` : null,
      bug.actualBehavior ? `Actual: ${bug.actualBehavior}` : null,
    ].filter(Boolean);

    const task = await this.tasksService.create(
      {
        title: bug.title,
        description: descriptionParts.length ? descriptionParts.join('\n\n') : undefined,
        projectId: bug.projectId,
        assigneeId: bug.assigneeId ?? undefined,
        reporterId: bug.reporterId,
        priority: bug.priority as any,
      } as any,
      actorUserId,
    );

    const updated = await this.bugsRepository.update(id, { linkedTaskId: task.id } as any);

    if (bug.assigneeId) {
      await this.notificationsService.notify({
        userId: bug.assigneeId,
        actorId: actorUserId,
        type: 'BUG_LINKED_TO_TASK',
        title: `Bug "${bug.title}" was converted to a task`,
        link: `/tasks/${task.id}`,
        taskId: task.id,
        bugId: id,
      });
    }

    return updated;
  }
}
