import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TasksRepository } from './tasks.repository';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto, AssignTaskDto, ChangeStatusDto } from './dto/task-filter.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

// Hardcoded system user id for automated actions; replace with auth context in production
const SYSTEM_USER_ID = 'system';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly activityService: ActivityService,
    private readonly notificationsService: NotificationsService,
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
      if (updateTaskDto.dueDate !== undefined) {
        updateData.dueDate = updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null;
      }
      if (updateTaskDto.estimatedHours !== undefined) updateData.estimatedHours = updateTaskDto.estimatedHours;
      if (updateTaskDto.actualHours !== undefined) updateData.actualHours = updateTaskDto.actualHours;
      if (updateTaskDto.isArchived !== undefined) updateData.isArchived = updateTaskDto.isArchived;

      // Track status change
      if (updateTaskDto.status && updateTaskDto.status !== existing.status) {
        updateData.status = updateTaskDto.status;
        if (updateTaskDto.status === 'DONE') {
          updateData.completedAt = new Date();
        } else {
          updateData.completedAt = null;
        }

        if (actorUserId) {
          await this.tasksRepository.createHistory({
            taskId: id,
            userId: actorUserId,
            field: 'status',
            oldValue: existing.status,
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
        if (actorUserId) {
          await this.tasksRepository.createHistory({
            taskId: id,
            userId: actorUserId,
            field: 'assignee',
            oldValue: existing.assigneeId || undefined,
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
          await this.tasksRepository.createHistory({
            taskId: id,
            userId: actorUserId,
            field: 'priority',
            oldValue: existing.priority,
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
    const task = await this.tasksRepository.update(id, {
      assigneeId: assignDto.assigneeId ?? null,
    });

    if (actorUserId) {
      await this.tasksRepository.createHistory({
        taskId: id,
        userId: actorUserId,
        field: 'assignee',
        oldValue: existing.assigneeId || undefined,
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
      await this.tasksRepository.createHistory({
        taskId: id,
        userId: actorUserId,
        field: 'status',
        oldValue: existing.status,
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

  async getHistory(id: string) {
    await this.findById(id);
    return this.tasksRepository.getHistory(id);
  }

  async getActivity(id: string) {
    await this.findById(id);
    return this.tasksRepository.getActivity(id);
  }

  async findSubtasks(taskId: string) {
    await this.findById(taskId);
    return this.tasksRepository.findSubtasks(taskId);
  }
}
