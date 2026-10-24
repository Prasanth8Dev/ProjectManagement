import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, TaskStatus, TaskPriority } from '@prisma/client';
import { getPaginationParams } from '../../common/utils/pagination.util';

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  private get taskIncludes() {
    return {
      project: { select: { id: true, name: true, color: true, slug: true } },
      assignee: { select: { id: true, name: true, avatar: true, email: true } },
      reporter: { select: { id: true, name: true, avatar: true } },
      milestone: { select: { id: true, name: true, status: true, dueDate: true } },
      labels: {
        include: { label: { select: { id: true, name: true, color: true } } },
      },
      _count: {
        select: {
          subtasks: true,
          comments: true,
          checklistItems: true,
          attachments: true,
        },
      },
    };
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    projectId?: string;
    assigneeId?: string;
    reporterId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    milestoneId?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    isArchived?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
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
      isArchived = false,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Prisma.TaskWhereInput = {
      parentTaskId: null, // top-level tasks only
      isArchived,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(projectId && { projectId }),
      ...(assigneeId && { assigneeId }),
      ...(reporterId && { reporterId }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(milestoneId && { milestoneId }),
      ...(dueDateFrom || dueDateTo
        ? {
            dueDate: {
              ...(dueDateFrom && { gte: new Date(dueDateFrom) }),
              ...(dueDateTo && { lte: new Date(dueDateTo) }),
            },
          }
        : {}),
    };

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: this.taskIncludes,
      }),
      this.prisma.task.count({ where }),
    ]);

    return { tasks, total };
  }

  async findById(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        ...this.taskIncludes,
        subtasks: {
          where: { isArchived: false },
          include: {
            assignee: { select: { id: true, name: true, avatar: true } },
            _count: { select: { checklistItems: true, comments: true } },
          },
          orderBy: { position: 'asc' },
        },
        checklistItems: {
          orderBy: { position: 'asc' },
        },
        attachments: {
          include: {
            uploader: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        activityEvents: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
  }

  async create(data: Prisma.TaskCreateInput) {
    return this.prisma.task.create({
      data,
      include: this.taskIncludes,
    });
  }

  async update(id: string, data: Prisma.TaskUncheckedUpdateInput) {
    return this.prisma.task.update({
      where: { id },
      data,
      include: this.taskIncludes,
    });
  }

  async delete(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }

  async createActivity(data: {
    taskId: string;
    userId?: string;
    eventType: Prisma.TaskActivityUncheckedCreateInput['eventType'];
    previousValue?: string;
    newValue?: string;
    reason?: string;
    comment?: string;
  }) {
    return this.prisma.taskActivity.create({ data });
  }

  /** Full lifecycle event log for a task, newest first — used by the UI timeline. */
  async getActivityEvents(taskId: string) {
    return this.prisma.taskActivity.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Same events, oldest first, unfiltered — used for duration computation. */
  async getActivityEventsAsc(taskId: string) {
    return this.prisma.taskActivity.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getActivityLog(taskId: string) {
    return this.prisma.activityLog.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findSubtasks(parentTaskId: string) {
    return this.prisma.task.findMany({
      where: { parentTaskId, isArchived: false },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        _count: { select: { checklistItems: true, comments: true } },
      },
      orderBy: { position: 'asc' },
    });
  }

  async getMaxPosition(projectId: string, status: TaskStatus): Promise<number> {
    const result = await this.prisma.task.aggregate({
      where: { projectId, status },
      _max: { position: true },
    });
    return result._max.position ?? 0;
  }
}
