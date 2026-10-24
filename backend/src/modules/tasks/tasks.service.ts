import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TasksRepository } from './tasks.repository';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto, AssignTaskDto, ChangeStatusDto } from './dto/task-filter.dto';
import {
  PauseTaskDto,
  BlockTaskDto,
  CompleteTaskDto,
  SendForReviewDto,
  CompleteReviewDto,
  CloseTaskDto,
} from './dto/task-control.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { assertTransition } from './task-transitions.util';
import { computeTaskTimeTracking } from './task-time-tracking.util';


// Roles allowed to control (start/pause/block/complete/etc.) a task they are
// not personally assigned to or reporting on — e.g. a manager stepping in.
const TASK_CONTROL_OVERRIDE_ROLES = ['ADMIN', 'MANAGER', 'PROJECT_MANAGER'];

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly activityService: ActivityService,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  async findAll(filterDto: TaskFilterDto) {
    const {
      page = 1,
      limit = 20,
      search,
      projectId,
      assigneeId,
      reporterId,
      status,
      priority,
      milestoneId,
      dueDateFrom,
      dueDateTo,
      isArchived,
      sortBy,
      sortOrder,
    } = filterDto;

    const { tasks, total } = await this.tasksRepository.findAll({
      page,
      limit,
      search,
      projectId,
      assigneeId,
      reporterId,
      status,
      priority,
      milestoneId,
      dueDateFrom,
      dueDateTo,
      isArchived,
      sortBy,
      sortOrder,
    });

    return createPaginatedResponse(tasks, total, page, limit);
  }

  async findById(id: string) {
    const task = await this.tasksRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  /**
   * Role check for the new lifecycle-control actions (start/pause/block/
   * complete/review/close). The assignee or reporter may always act on
   * their own task; managers/admins/PMs may act on any task. Everyone else
   * is blocked. This intentionally does not touch the older create/update/
   * assign endpoints, which remain open as before.
   */
  private async assertCanControlTask(
    task: { assigneeId: string | null; reporterId: string | null },
    actorUserId?: string,
  ) {
    if (!actorUserId) return; // no actor context (e.g. system/demo calls) — allow
    if (actorUserId === task.assigneeId || actorUserId === task.reporterId) return;

    const actor = await this.usersService.findById(actorUserId).catch(() => null);
    if (actor && TASK_CONTROL_OVERRIDE_ROLES.includes(actor.role)) return;

    throw new ForbiddenException(
      'Only the assignee, reporter, or a manager/admin can perform this action.',
    );
  }

  async create(createTaskDto: CreateTaskDto, actorUserId?: string) {
    try {
      const maxPos = await this.tasksRepository.getMaxPosition(
        createTaskDto.projectId,
        createTaskDto.status || 'BACKLOG',
      );

      const task = await this.tasksRepository.create({
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status || 'BACKLOG',
        priority: createTaskDto.priority || 'MEDIUM',
        estimatedHours: createTaskDto.estimatedHours,
        startDate: createTaskDto.startDate ? new Date(createTaskDto.startDate) : undefined,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
        assignedAt: createTaskDto.assigneeId ? new Date() : undefined,
        position: maxPos + 1,
        project: { connect: { id: createTaskDto.projectId } },
        ...(createTaskDto.assigneeId && {
          assignee: { connect: { id: createTaskDto.assigneeId } },
        }),
        ...(createTaskDto.reporterId && {
          reporter: { connect: { id: createTaskDto.reporterId } },
        }),
        ...(createTaskDto.milestoneId && {
          milestone: { connect: { id: createTaskDto.milestoneId } },
        }),
        ...(createTaskDto.parentTaskId && {
          parentTask: { connect: { id: createTaskDto.parentTaskId } },
        }),
      });

      const userId = actorUserId || createTaskDto.reporterId || createTaskDto.assigneeId;
      if (userId) {
        await this.activityService.logActivity({
          userId,
          projectId: createTaskDto.projectId,
          taskId: task.id,
          action: 'CREATED',
          entityType: 'Task',
          entityId: task.id,
          entityTitle: task.title,
        });
        await this.tasksRepository.createActivity({
          taskId: task.id,
          userId,
          eventType: 'TASK_CREATED',
        });
        if (createTaskDto.assigneeId) {
          await this.tasksRepository.createActivity({
            taskId: task.id,
            userId,
            eventType: 'TASK_ASSIGNED',
            newValue: createTaskDto.assigneeId,
          });
        }
      }

      if (createTaskDto.assigneeId) {
        await this.notificationsService.notify({
          userId: createTaskDto.assigneeId,
          actorId: actorUserId,
          type: 'TASK_ASSIGNED',
          title: `You were assigned to "${task.title}"`,
          link: `/tasks/${task.id}`,
          taskId: task.id,
        });
      }

      return task;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, actorUserId?: string) {
    const existing = await this.findById(id);
    try {
      const updateData: Prisma.TaskUncheckedUpdateInput = {};

      if (updateTaskDto.title !== undefined) updateData.title = updateTaskDto.title;
      if (updateTaskDto.description !== undefined) updateData.description = updateTaskDto.description;
      if (updateTaskDto.priority !== undefined) updateData.priority = updateTaskDto.priority;
      if (updateTaskDto.milestoneId !== undefined) {
        updateData.milestoneId = updateTaskDto.milestoneId || null;
      }
      if (updateTaskDto.startDate !== undefined) {
        updateData.startDate = updateTaskDto.startDate ? new Date(updateTaskDto.startDate) : null;
      }
      if (updateTaskDto.estimatedHours !== undefined) updateData.estimatedHours = updateTaskDto.estimatedHours;
      if (updateTaskDto.actualHours !== undefined) updateData.actualHours = updateTaskDto.actualHours;
      if (updateTaskDto.isArchived !== undefined) updateData.isArchived = updateTaskDto.isArchived;

      // Track due date (ETA) change
      if (updateTaskDto.dueDate !== undefined) {
        const newDueDate = updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null;
        const oldDueDateIso = existing.dueDate ? new Date(existing.dueDate).toISOString() : undefined;
        const newDueDateIso = newDueDate ? newDueDate.toISOString() : undefined;
        if (oldDueDateIso !== newDueDateIso) {
          updateData.dueDate = newDueDate;
          if (actorUserId) {
            await this.tasksRepository.createActivity({
              taskId: id,
              userId: actorUserId,
              eventType: 'ETA_CHANGED',
              previousValue: oldDueDateIso,
              newValue: newDueDateIso,
            });
          }
        }
      }

      // Track status change
      if (updateTaskDto.status && updateTaskDto.status !== existing.status) {
        updateData.status = updateTaskDto.status;
        if (updateTaskDto.status === 'DONE') {
          updateData.completedAt = new Date();
        } else {
          updateData.completedAt = null;
        }

        if (actorUserId) {
          await this.tasksRepository.createActivity({
            taskId: id,
            userId: actorUserId,
            eventType: 'STATUS_CHANGED',
            previousValue: existing.status,
            newValue: updateTaskDto.status,
          });
          await this.activityService.logActivity({
            userId: actorUserId,
            projectId: existing.projectId,
            taskId: id,
            action: 'STATUS_CHANGED',
            entityType: 'Task',
            entityId: id,
            entityTitle: existing.title,
            metadata: { from: existing.status, to: updateTaskDto.status },
          });
        }
      }

      // Track assignee change
      if (updateTaskDto.assigneeId !== undefined && updateTaskDto.assigneeId !== existing.assigneeId) {
        updateData.assigneeId = updateTaskDto.assigneeId || null;
        if (updateTaskDto.assigneeId && !existing.assigneeId) {
          updateData.assignedAt = new Date();
        }
        if (actorUserId) {
          await this.tasksRepository.createActivity({
            taskId: id,
            userId: actorUserId,
            eventType: existing.assigneeId ? 'TASK_REASSIGNED' : 'TASK_ASSIGNED',
            previousValue: existing.assigneeId || undefined,
            newValue: updateTaskDto.assigneeId || undefined,
          });
        }
        if (updateTaskDto.assigneeId) {
          await this.notificationsService.notify({
            userId: updateTaskDto.assigneeId,
            actorId: actorUserId,
            type: 'TASK_ASSIGNED',
            title: `You were assigned to "${existing.title}"`,
            link: `/tasks/${id}`,
            taskId: id,
          });
        }
      }

      // Track priority change
      if (updateTaskDto.priority && updateTaskDto.priority !== existing.priority) {
        if (actorUserId) {
          await this.tasksRepository.createActivity({
            taskId: id,
            userId: actorUserId,
            eventType: 'PRIORITY_CHANGED',
            previousValue: existing.priority,
            newValue: updateTaskDto.priority,
          });
          await this.activityService.logActivity({
            userId: actorUserId,
            projectId: existing.projectId,
            taskId: id,
            action: 'PRIORITY_CHANGED',
            entityType: 'Task',
            entityId: id,
            entityTitle: existing.title,
            metadata: { from: existing.priority, to: updateTaskDto.priority },
          });
        }
      }

      return await this.tasksRepository.update(id, updateData);
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string) {
    await this.findById(id);
    return this.tasksRepository.delete(id);
  }

  async assign(id: string, assignDto: AssignTaskDto, actorUserId?: string) {
    const existing = await this.findById(id);
    const isFirstAssignment = !existing.assigneeId && !!assignDto.assigneeId;
    const task = await this.tasksRepository.update(id, {
      assigneeId: assignDto.assigneeId ?? null,
      ...(isFirstAssignment && { assignedAt: new Date() }),
    });

    if (actorUserId) {
      await this.tasksRepository.createActivity({
        taskId: id,
        userId: actorUserId,
        eventType: existing.assigneeId ? 'TASK_REASSIGNED' : 'TASK_ASSIGNED',
        previousValue: existing.assigneeId || undefined,
        newValue: assignDto.assigneeId || undefined,
      });
      await this.activityService.logActivity({
        userId: actorUserId,
        projectId: existing.projectId,
        taskId: id,
        action: assignDto.assigneeId ? 'ASSIGNED' : 'REASSIGNED',
        entityType: 'Task',
        entityId: id,
        entityTitle: existing.title,
        metadata: { assigneeId: assignDto.assigneeId },
      });
    }

    if (assignDto.assigneeId && assignDto.assigneeId !== existing.assigneeId) {
      await this.notificationsService.notify({
        userId: assignDto.assigneeId,
        actorId: actorUserId,
        type: 'TASK_ASSIGNED',
        title: `You were assigned to "${existing.title}"`,
        link: `/tasks/${id}`,
        taskId: id,
      });
    }

    return task;
  }

  async changeStatus(id: string, statusDto: ChangeStatusDto, actorUserId?: string) {
    const existing = await this.findById(id);
    const updateData: Record<string, unknown> = {
      status: statusDto.status,
    };

    if (statusDto.status === 'DONE') {
      updateData.completedAt = new Date();
    } else if (existing.status === 'DONE') {
      updateData.completedAt = null;
    }

    const task = await this.tasksRepository.update(id, updateData);

    if (actorUserId && statusDto.status !== existing.status) {
      await this.tasksRepository.createActivity({
        taskId: id,
        userId: actorUserId,
        eventType: 'STATUS_CHANGED',
        previousValue: existing.status,
        newValue: statusDto.status,
      });
      await this.activityService.logActivity({
        userId: actorUserId,
        projectId: existing.projectId,
        taskId: id,
        action: 'STATUS_CHANGED',
        entityType: 'Task',
        entityId: id,
        entityTitle: existing.title,
        metadata: { from: existing.status, to: statusDto.status },
      });
    }

    return task;
  }

  // ---------------------------------------------------------------------
  // Lifecycle controls — each validates the transition, mutates the task,
  // records an immutable TaskActivity event, and fires notifications.
  // ---------------------------------------------------------------------

  async startTask(id: string, actorUserId?: string) {
    const existing = await this.findById(id);
    await this.assertCanControlTask(existing, actorUserId);
    assertTransition('start', existing);

    const startedAt = new Date();
    const task = await this.tasksRepository.update(id, {
      status: 'IN_PROGRESS',
      startedAt,
    });

    await this.tasksRepository.createActivity({
      taskId: id,
      userId: actorUserId,
      eventType: 'TASK_STARTED',
    });

    return task;
  }

  async pauseTask(id: string, dto: PauseTaskDto, actorUserId?: string) {
    const existing = await this.findById(id);
    await this.assertCanControlTask(existing, actorUserId);
    assertTransition('pause', existing);

    const task = await this.tasksRepository.update(id, { isPaused: true });
    await this.tasksRepository.createActivity({
      taskId: id,
      userId: actorUserId,
      eventType: 'TASK_PAUSED',
      reason: dto.reason,
    });

    return task;
  }

  async resumeTask(id: string, actorUserId?: string) {
    const existing = await this.findById(id);
    await this.assertCanControlTask(existing, actorUserId);
    assertTransition('resume', existing);

    const task = await this.tasksRepository.update(id, { isPaused: false });
    await this.tasksRepository.createActivity({
      taskId: id,
      userId: actorUserId,
      eventType: 'TASK_RESUMED',
    });

    return task;
  }

  async blockTask(id: string, dto: BlockTaskDto, actorUserId?: string) {
    const existing = await this.findById(id);
    await this.assertCanControlTask(existing, actorUserId);
    assertTransition('block', existing);

    const task = await this.tasksRepository.update(id, {
      isBlocked: true,
      blockedReason: dto.reason ?? null,
    });
    await this.tasksRepository.createActivity({
      taskId: id,
      userId: actorUserId,
      eventType: 'TASK_BLOCKED',
      reason: dto.reason,
    });

    if (existing.assigneeId) {
      await this.notificationsService.notify({
        userId: existing.assigneeId,
        actorId: actorUserId,
        type: 'TASK_BLOCKED',
        title: `"${existing.title}" was marked as blocked`,
        message: dto.reason,
        link: `/tasks/${id}`,
        taskId: id,
      });
    }

    return task;
  }

  async unblockTask(id: string, actorUserId?: string) {
    const existing = await this.findById(id);
    await this.assertCanControlTask(existing, actorUserId);
    assertTransition('unblock', existing);

    const task = await this.tasksRepository.update(id, {
      isBlocked: false,
      blockedReason: null,
    });
    await this.tasksRepository.createActivity({
      taskId: id,
      userId: actorUserId,
      eventType: 'TASK_UNBLOCKED',
    });

    if (existing.assigneeId) {
      await this.notificationsService.notify({
        userId: existing.assigneeId,
        actorId: actorUserId,
        type: 'TASK_UNBLOCKED',
        title: `"${existing.title}" was unblocked`,
        link: `/tasks/${id}`,
        taskId: id,
      });
    }

    return task;
  }

  async completeTask(id: string, dto: CompleteTaskDto, actorUserId?: string) {
    const existing = await this.findById(id);
    await this.assertCanControlTask(existing, actorUserId);
    assertTransition('complete', existing);

    const task = await this.tasksRepository.update(id, {
      status: 'DONE',
      completedAt: new Date(),
      isPaused: false,
    });
    await this.tasksRepository.createActivity({
      taskId: id,
      userId: actorUserId,
      eventType: 'TASK_COMPLETED',
      comment: dto.comment,
    });

    if (existing.reporterId) {
      await this.notificationsService.notify({
        userId: existing.reporterId,
        actorId: actorUserId,
        type: 'TASK_COMPLETED',
        title: `"${existing.title}" was completed`,
        link: `/tasks/${id}`,
        taskId: id,
      });
    }

    return task;
  }

  async sendForReview(id: string, dto: SendForReviewDto, actorUserId?: string) {
    const existing = await this.findById(id);
    await this.assertCanControlTask(existing, actorUserId);
    assertTransition('sendForReview', existing);

    const task = await this.tasksRepository.update(id, { status: 'IN_REVIEW' });
    await this.tasksRepository.createActivity({
      taskId: id,
      userId: actorUserId,
      eventType: 'REVIEW_STARTED',
      comment: dto.comment,
    });

    if (existing.reporterId) {
      await this.notificationsService.notify({
        userId: existing.reporterId,
        actorId: actorUserId,
        type: 'REVIEW_REQUESTED',
        title: `Review requested for "${existing.title}"`,
        link: `/tasks/${id}`,
        taskId: id,
      });
    }

    return task;
  }

  async completeReview(id: string, dto: CompleteReviewDto, actorUserId?: string) {
    const existing = await this.findById(id);
    await this.assertCanControlTask(existing, actorUserId);
    assertTransition('completeReview', existing);

    const task = await this.tasksRepository.update(id, {
      status: 'DONE',
      completedAt: existing.completedAt ?? new Date(),
    });
    await this.tasksRepository.createActivity({
      taskId: id,
      userId: actorUserId,
      eventType: 'REVIEW_COMPLETED',
      comment: dto.comment,
    });

    return task;
  }

  async closeTask(id: string, dto: CloseTaskDto, actorUserId?: string) {
    const existing = await this.findById(id);
    await this.assertCanControlTask(existing, actorUserId);
    assertTransition('close', existing);

    const task = await this.tasksRepository.update(id, { status: 'CLOSED' });
    await this.tasksRepository.createActivity({
      taskId: id,
      userId: actorUserId,
      eventType: 'TASK_CLOSED',
      comment: dto.comment,
    });

    return task;
  }

  /** Called by CommentsService whenever a comment is added to a task. */
  async logCommentActivity(taskId: string, userId: string, commentId: string) {
    await this.tasksRepository.createActivity({
      taskId,
      userId,
      eventType: 'COMMENT_ADDED',
      newValue: commentId,
    });
  }

  async getTimeTracking(id: string) {
    const task = await this.findById(id);
    const events = await this.tasksRepository.getActivityEventsAsc(id);
    return computeTaskTimeTracking(
      {
        assignedAt: task.assignedAt,
        startedAt: task.startedAt,
        completedAt: task.completedAt,
        isPaused: task.isPaused,
        isBlocked: task.isBlocked,
        status: task.status,
      },
      events,
    );
  }

  async getHistory(id: string) {
    await this.findById(id);
    return this.tasksRepository.getActivityEvents(id);
  }

  async getActivity(id: string) {
    await this.findById(id);
    return this.tasksRepository.getActivityLog(id);
  }

  async findSubtasks(taskId: string) {
    await this.findById(taskId);
    return this.tasksRepository.findSubtasks(taskId);
  }
}
