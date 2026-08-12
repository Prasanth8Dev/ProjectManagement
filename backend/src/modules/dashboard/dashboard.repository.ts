import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, subtractDays } from '../../common/utils/date.util';
import { format } from 'date-fns';

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(userId?: string) {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    // For developer-scoped view, filter tasks by assignee
    const taskFilter = userId
      ? { isArchived: false, parentTaskId: null, assigneeId: userId }
      : { isArchived: false, parentTaskId: null };

    const [
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      totalMembers,
      overdueTasksCount,
      todayUpdatesCount,
    ] = await Promise.all([
      userId
        ? this.prisma.project.count({
            where: {
              isArchived: false,
              members: { some: { userId } },
            },
          })
        : this.prisma.project.count({ where: { isArchived: false } }),
      userId
        ? this.prisma.project.count({
            where: {
              status: 'ACTIVE',
              isArchived: false,
              members: { some: { userId } },
            },
          })
        : this.prisma.project.count({ where: { status: 'ACTIVE', isArchived: false } }),
      this.prisma.task.count({ where: taskFilter }),
      this.prisma.task.count({ where: { ...taskFilter, status: 'DONE' } }),
      this.prisma.task.count({
        where: { ...taskFilter, status: { notIn: ['DONE', 'CANCELLED'] } },
      }),
      this.prisma.task.count({ where: { ...taskFilter, status: 'IN_PROGRESS' } }),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.task.count({
        where: {
          ...taskFilter,
          dueDate: { lt: today },
          status: { notIn: ['DONE', 'CANCELLED'] },
        },
      }),
      this.prisma.dailyWorkUpdate.count({
        where: {
          date: { gte: todayStart, lte: todayEnd },
          ...(userId ? { userId } : {}),
        },
      }),
    ]);

    return {
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      totalMembers,
      overdueTasksCount,
      todayUpdatesCount,
    };
  }

  async getCharts(userId?: string) {
    const today = new Date();
    const weekStart = startOfWeek(today);

    const taskWhere = userId ? { isArchived: false, assigneeId: userId } : { isArchived: false };

    // Tasks by status
    const tasksByStatusRaw = await this.prisma.task.groupBy({
      by: ['status'],
      where: taskWhere,
      _count: { status: true },
    });

    const tasksByStatus = tasksByStatusRaw.map((item) => ({
      status: item.status,
      count: item._count.status,
    }));

    // Weekly progress: last 7 days
    const weeklyProgress: Array<{ day: string; completed: number; created: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const day = subtractDays(today, i);
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);

      const [completed, created] = await Promise.all([
        this.prisma.task.count({
          where: {
            completedAt: { gte: dayStart, lte: dayEnd },
          },
        }),
        this.prisma.task.count({
          where: {
            createdAt: { gte: dayStart, lte: dayEnd },
          },
        }),
      ]);

      weeklyProgress.push({
        day: format(day, 'EEE'),
        completed,
        created,
      });
    }

    // Project progress
    const projects = await this.prisma.project.findMany({
      where: {
        isArchived: false,
        status: { not: 'CANCELLED' },
        ...(userId ? { members: { some: { userId } } } : {}),
      },
      include: {
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const projectProgress = await Promise.all(
      projects.map(async (project) => {
        const total = await this.prisma.task.count({
          where: { projectId: project.id, isArchived: false },
        });
        const completed = await this.prisma.task.count({
          where: { projectId: project.id, status: 'DONE', isArchived: false },
        });

        return {
          projectId: project.id,
          name: project.name,
          color: project.color,
          total,
          completed,
          percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      }),
    );

    return { tasksByStatus, weeklyProgress, projectProgress };
  }

  async getTodayTasks(userId?: string) {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    return this.prisma.task.findMany({
      where: {
        isArchived: false,
        dueDate: { gte: todayStart, lte: todayEnd },
        status: { notIn: ['DONE', 'CANCELLED'] },
        ...(userId ? { assigneeId: userId } : {}),
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { priority: 'desc' },
    });
  }

  async getUpcomingDeadlines(userId?: string) {
    const today = new Date();
    const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return this.prisma.task.findMany({
      where: {
        isArchived: false,
        dueDate: { gte: today, lte: next7Days },
        status: { notIn: ['DONE', 'CANCELLED'] },
        ...(userId ? { assigneeId: userId } : {}),
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getRecentActivity(limit: number = 20) {
    return this.prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });
  }
}
