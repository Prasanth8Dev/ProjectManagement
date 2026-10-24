import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, ProjectStatus, ProjectPriority, ProjectMemberRole } from '@prisma/client';
import { getPaginationParams } from '../../common/utils/pagination.util';
import { computeTaskTimeTracking } from '../tasks/task-time-tracking.util';

@Injectable()
export class ProjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    status?: ProjectStatus;
    priority?: ProjectPriority;
    isArchived?: boolean;
    teamId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page,
      limit,
      search,
      status,
      priority,
      isArchived,
      teamId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Prisma.ProjectWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(isArchived !== undefined && { isArchived }),
      ...(teamId && { teams: { some: { teamId } } }),
    };

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, avatar: true } },
            },
            take: 5,
          },
          _count: {
            select: {
              tasks: true,
              members: true,
              milestones: true,
            },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { projects, total };
  }

  async findById(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                jobTitle: true,
              },
            },
          },
        },
        teams: {
          include: {
            team: { select: { id: true, name: true, avatar: true, color: true } },
          },
        },
        milestones: {
          orderBy: { dueDate: 'asc' },
        },
        labels: true,
        _count: {
          select: {
            tasks: true,
            members: true,
            milestones: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.project.findUnique({ where: { slug } });
  }

  async create(data: Prisma.ProjectCreateInput) {
    return this.prisma.project.create({
      data,
      include: {
        _count: { select: { tasks: true, members: true } },
      },
    });
  }

  async update(id: string, data: Prisma.ProjectUpdateInput) {
    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }

  async getStats(id: string) {
    const tasksByStatus = await this.prisma.task.groupBy({
      by: ['status'],
      where: { projectId: id, isArchived: false },
      _count: { status: true },
    });

    const totalTasks = await this.prisma.task.count({
      where: { projectId: id, isArchived: false },
    });

    const completedTasks = await this.prisma.task.count({
      where: { projectId: id, status: 'DONE', isArchived: false },
    });

    const overdueTasks = await this.prisma.task.count({
      where: {
        projectId: id,
        isArchived: false,
        dueDate: { lt: new Date() },
        status: { notIn: ['DONE', 'CANCELLED'] },
      },
    });

    return {
      tasksByStatus: tasksByStatus.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      totalTasks,
      completedTasks,
      overdueTasks,
      completionPercent:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  }

  /**
   * Project-level time/productivity analytics, derived entirely from the
   * TaskActivity event log (nothing here is stored — recomputed on read so
   * it can never drift or be hand-edited). Tasks with no startedAt (created
   * before event tracking existed, or never started) are excluded from the
   * duration averages but still counted in the status breakdown.
   */
  async getProductivityStats(projectId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { projectId, isArchived: false },
      select: {
        id: true,
        status: true,
        isPaused: true,
        isBlocked: true,
        assignedAt: true,
        startedAt: true,
        completedAt: true,
        dueDate: true,
      },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'DONE' || t.status === 'CLOSED').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const blockedTasks = tasks.filter((t) => t.isBlocked).length;
    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) =>
        t.dueDate &&
        t.dueDate < now &&
        !['DONE', 'CLOSED', 'CANCELLED'].includes(t.status),
    ).length;

    if (totalTasks === 0) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        blockedTasks: 0,
        overdueTasks: 0,
        avgStartDelayMs: null,
        avgCompletionTimeMs: null,
        avgActiveWorkingTimeMs: null,
        totalBlockedTimeMs: 0,
        totalPausedTimeMs: 0,
        etaVarianceMs: null,
        tasksWithHistoricalDataUnavailable: 0,
      };
    }

    const events = await this.prisma.taskActivity.findMany({
      where: { taskId: { in: tasks.map((t) => t.id) } },
      orderBy: { createdAt: 'asc' },
      select: { taskId: true, eventType: true, createdAt: true },
    });

    const eventsByTask = new Map<string, typeof events>();
    for (const event of events) {
      const list = eventsByTask.get(event.taskId) ?? [];
      list.push(event);
      eventsByTask.set(event.taskId, list);
    }

    const startDelays: number[] = [];
    const completionTimes: number[] = [];
    const activeWorkingTimes: number[] = [];
    const etaVariances: number[] = [];
    let totalBlockedTimeMs = 0;
    let totalPausedTimeMs = 0;
    let historicalUnavailableCount = 0;

    for (const task of tasks) {
      const tracking = computeTaskTimeTracking(task, eventsByTask.get(task.id) ?? []);

      if (tracking.historicalTrackingUnavailable) {
        historicalUnavailableCount += 1;
        continue;
      }

      if (tracking.assignToStartMs !== null) startDelays.push(tracking.assignToStartMs);
      if (tracking.startToCompletionMs !== null) completionTimes.push(tracking.startToCompletionMs);
      if (tracking.activeWorkingTimeMs !== null) activeWorkingTimes.push(tracking.activeWorkingTimeMs);
      totalBlockedTimeMs += tracking.blockedDurationMs;
      totalPausedTimeMs += tracking.pausedDurationMs;

      if (tracking.completedAt && task.dueDate) {
        etaVariances.push(new Date(tracking.completedAt).getTime() - task.dueDate.getTime());
      }
    }

    const avg = (values: number[]) =>
      values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      overdueTasks,
      avgStartDelayMs: avg(startDelays),
      avgCompletionTimeMs: avg(completionTimes),
      avgActiveWorkingTimeMs: avg(activeWorkingTimes),
      totalBlockedTimeMs,
      totalPausedTimeMs,
      etaVarianceMs: avg(etaVariances),
      tasksWithHistoricalDataUnavailable: historicalUnavailableCount,
    };
  }

  async findMember(projectId: string, userId: string) {
    return this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
  }

  async addMember(projectId: string, userId: string, role: ProjectMemberRole) {
    return this.prisma.projectMember.create({
      data: { projectId, userId, role },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
  }

  async removeMember(projectId: string, userId: string) {
    return this.prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });
  }

  async getActivity(params: {
    projectId: string;
    page: number;
    limit: number;
  }) {
    const { projectId, page, limit } = params;
    const { skip, take } = getPaginationParams(page, limit);

    const [activity, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where: { projectId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          task: { select: { id: true, title: true } },
        },
      }),
      this.prisma.activityLog.count({ where: { projectId } }),
    ]);

    return { activity, total };
  }
}
