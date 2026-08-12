import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, ActivityAction } from '@prisma/client';
import { getPaginationParams } from '../../common/utils/pagination.util';

export interface LogActivityData {
  userId: string;
  projectId?: string;
  taskId?: string;
  action: ActivityAction;
  entityType: string;
  entityId: string;
  entityTitle?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class ActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async logActivity(data: LogActivityData) {
    return this.prisma.activityLog.create({
      data: {
        userId: data.userId,
        projectId: data.projectId,
        taskId: data.taskId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        entityTitle: data.entityTitle,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
  }

  async findAll(params: {
    page: number;
    limit: number;
    userId?: string;
    projectId?: string;
    taskId?: string;
    action?: ActivityAction;
    dateFrom?: string;
    dateTo?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, userId, projectId, taskId, action, dateFrom, dateTo, sortOrder = 'desc' } = params;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Prisma.ActivityLogWhereInput = {
      ...(userId && { userId }),
      ...(projectId && { projectId }),
      ...(taskId && { taskId }),
      ...(action && { action }),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          }
        : {}),
    };

    const [activity, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: sortOrder },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          project: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
        },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return { activity, total };
  }

  async findRecent(limit: number = 20) {
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
