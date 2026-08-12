import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getTaskCompletionReport(params: {
    projectId?: string;
    assigneeId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const where: Prisma.TaskWhereInput = {
      isArchived: false,
      ...(params.projectId && { projectId: params.projectId }),
      ...(params.assigneeId && { assigneeId: params.assigneeId }),
      ...(params.dateFrom || params.dateTo
        ? {
            createdAt: {
              ...(params.dateFrom && { gte: new Date(params.dateFrom) }),
              ...(params.dateTo && { lte: new Date(params.dateTo) }),
            },
          }
        : {}),
    };

    const [total, completed, tasksByStatus, overdue] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.count({ where: { ...where, status: 'DONE' } }),
      this.prisma.task.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      this.prisma.task.count({
        where: {
          ...where,
          dueDate: { lt: new Date() },
          status: { notIn: ['DONE', 'CANCELLED'] },
        },
      }),
    ]);

    const pending = total - completed;

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      breakdown: tasksByStatus.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
    };
  }

  async getOverdueTasks() {
    return this.prisma.task.findMany({
      where: {
        isArchived: false,
        dueDate: { lt: new Date() },
        status: { notIn: ['DONE', 'CANCELLED'] },
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
        milestone: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getEmployeeReport(userId: string, params: { dateFrom?: string; dateTo?: string }) {
    const dateFilter =
      params.dateFrom || params.dateTo
        ? {
            createdAt: {
              ...(params.dateFrom && { gte: new Date(params.dateFrom) }),
              ...(params.dateTo && { lte: new Date(params.dateTo) }),
            },
          }
        : {};

    const [assignedTasks, completedTasks, updates] = await Promise.all([
      this.prisma.task.findMany({
        where: { assigneeId: userId, isArchived: false, ...dateFilter },
        include: {
          project: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.task.count({
        where: { assigneeId: userId, status: 'DONE', isArchived: false, ...dateFilter },
      }),
      this.prisma.dailyWorkUpdate.findMany({
        where: {
          userId,
          ...(params.dateFrom || params.dateTo
            ? {
                date: {
                  ...(params.dateFrom && { gte: new Date(params.dateFrom) }),
                  ...(params.dateTo && { lte: new Date(params.dateTo) }),
                },
              }
            : {}),
        },
        orderBy: { date: 'desc' },
      }),
    ]);

    return {
      userId,
      totalAssigned: assignedTasks.length,
      completed: completedTasks,
      pending: assignedTasks.length - completedTasks,
      updatesSubmitted: updates.length,
      tasks: assignedTasks,
      updates,
    };
  }

  async getProjectReport(projectId: string) {
    const [project, tasksByStatus, milestones, recentActivity] = await Promise.all([
      this.prisma.project.findUnique({
        where: { id: projectId },
        include: {
          members: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
          },
        },
      }),
      this.prisma.task.groupBy({
        by: ['status'],
        where: { projectId, isArchived: false },
        _count: { status: true },
      }),
      this.prisma.milestone.findMany({
        where: { projectId },
        include: { _count: { select: { tasks: true } } },
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.activityLog.findMany({
        where: { projectId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      }),
    ]);

    const totalTasks = tasksByStatus.reduce((sum, item) => sum + item._count.status, 0);
    const completedTasks =
      tasksByStatus.find((item) => item.status === 'DONE')?._count.status ?? 0;

    return {
      project,
      taskBreakdown: tasksByStatus.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      totalTasks,
      completedTasks,
      completionPercent: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      milestones,
      recentActivity,
    };
  }
}
