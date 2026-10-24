import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PerformanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveUsers(userIds?: string[]) {
    return this.prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        ...(userIds && { id: { in: userIds } }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        jobTitle: true,
        department: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        jobTitle: true,
        department: true,
        status: true,
      },
    });
  }

  async getTasksForUsers(userIds: string[]) {
    return this.prisma.task.findMany({
      where: { assigneeId: { in: userIds }, isArchived: false },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        assigneeId: true,
        dueDate: true,
        completedAt: true,
        projectId: true,
        createdAt: true,
        project: { select: { id: true, name: true, color: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBugsForUsers(userIds: string[]) {
    return this.prisma.bug.findMany({
      where: { assigneeId: { in: userIds }, isArchived: false },
      select: {
        id: true,
        title: true,
        status: true,
        severity: true,
        priority: true,
        platform: true,
        assigneeId: true,
        createdAt: true,
        resolvedAt: true,
        closedAt: true,
        project: { select: { id: true, name: true, color: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTaskStatusHistory(taskIds: string[]) {
    if (!taskIds.length) return [];
    return this.prisma.taskActivity.findMany({
      where: { taskId: { in: taskIds }, eventType: 'STATUS_CHANGED' },
      select: {
        taskId: true,
        userId: true,
        eventType: true,
        previousValue: true,
        newValue: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getBugStatusHistory(bugIds: string[]) {
    if (!bugIds.length) return [];
    return this.prisma.bugHistory.findMany({
      where: { bugId: { in: bugIds }, field: 'status' },
      select: { bugId: true, userId: true, field: true, oldValue: true, newValue: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}
