import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { getPaginationParams } from '../../common/utils/pagination.util';

@Injectable()
export class DailyUpdatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private get updateIncludes() {
    return {
      user: { select: { id: true, name: true, avatar: true, email: true } },
      tasks: {
        include: {
          task: {
            select: { id: true, title: true, status: true, priority: true },
          },
        },
      },
      projects: {
        include: {
          project: { select: { id: true, name: true, color: true } },
        },
      },
    };
  }

  async findAll(params: {
    page: number;
    limit: number;
    userId?: string;
    projectId?: string;
    dateFrom?: string;
    dateTo?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, userId, projectId, dateFrom, dateTo, sortOrder = 'desc' } = params;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Prisma.DailyWorkUpdateWhereInput = {
      ...(userId && { userId }),
      ...(projectId && { projects: { some: { projectId } } }),
      ...(dateFrom || dateTo
        ? {
            date: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          }
        : {}),
    };

    const [updates, total] = await Promise.all([
      this.prisma.dailyWorkUpdate.findMany({
        where,
        skip,
        take,
        orderBy: { date: sortOrder },
        include: this.updateIncludes,
      }),
      this.prisma.dailyWorkUpdate.count({ where }),
    ]);

    return { updates, total };
  }

  async findById(id: string) {
    return this.prisma.dailyWorkUpdate.findUnique({
      where: { id },
      include: this.updateIncludes,
    });
  }

  async findByUserAndDate(userId: string, date: Date) {
    return this.prisma.dailyWorkUpdate.findUnique({
      where: { userId_date: { userId, date } },
      include: this.updateIncludes,
    });
  }

  async findForDateRange(dateFrom: Date, dateTo: Date) {
    return this.prisma.dailyWorkUpdate.findMany({
      where: { date: { gte: dateFrom, lte: dateTo } },
      include: this.updateIncludes,
      orderBy: [{ date: 'desc' }, { userId: 'asc' }],
    });
  }

  async create(data: {
    userId: string;
    date: Date;
    summary: string;
    hoursWorked: number;
    tomorrowPlan?: string;
    blockers?: string;
    mood?: number;
    tasks?: Array<{
      taskId: string;
      isCompleted?: boolean;
      isBlocked?: boolean;
      hoursSpent?: number;
      notes?: string;
    }>;
    projectIds?: string[];
  }) {
    return this.prisma.dailyWorkUpdate.create({
      data: {
        userId: data.userId,
        date: data.date,
        summary: data.summary,
        hoursWorked: data.hoursWorked,
        tomorrowPlan: data.tomorrowPlan,
        blockers: data.blockers,
        mood: data.mood,
        tasks: data.tasks
          ? {
              create: data.tasks.map((t) => ({
                taskId: t.taskId,
                isCompleted: t.isCompleted ?? false,
                isBlocked: t.isBlocked ?? false,
                hoursSpent: t.hoursSpent,
                notes: t.notes,
              })),
            }
          : undefined,
        projects: data.projectIds
          ? {
              create: data.projectIds.map((pid) => ({ projectId: pid })),
            }
          : undefined,
      },
      include: this.updateIncludes,
    });
  }

  async update(
    id: string,
    data: {
      summary?: string;
      hoursWorked?: number;
      tomorrowPlan?: string;
      blockers?: string;
      mood?: number;
      tasks?: Array<{
        taskId: string;
        isCompleted?: boolean;
        isBlocked?: boolean;
        hoursSpent?: number;
        notes?: string;
      }>;
      projectIds?: string[];
    },
  ) {
    // Delete and recreate tasks and projects if provided
    if (data.tasks !== undefined) {
      await this.prisma.dailyWorkUpdateTask.deleteMany({ where: { updateId: id } });
    }
    if (data.projectIds !== undefined) {
      await this.prisma.dailyWorkUpdateProject.deleteMany({ where: { updateId: id } });
    }

    return this.prisma.dailyWorkUpdate.update({
      where: { id },
      data: {
        ...(data.summary !== undefined && { summary: data.summary }),
        ...(data.hoursWorked !== undefined && { hoursWorked: data.hoursWorked }),
        ...(data.tomorrowPlan !== undefined && { tomorrowPlan: data.tomorrowPlan }),
        ...(data.blockers !== undefined && { blockers: data.blockers }),
        ...(data.mood !== undefined && { mood: data.mood }),
        ...(data.tasks !== undefined && {
          tasks: {
            create: data.tasks.map((t) => ({
              taskId: t.taskId,
              isCompleted: t.isCompleted ?? false,
              isBlocked: t.isBlocked ?? false,
              hoursSpent: t.hoursSpent,
              notes: t.notes,
            })),
          },
        }),
        ...(data.projectIds !== undefined && {
          projects: {
            create: data.projectIds.map((pid) => ({ projectId: pid })),
          },
        }),
      },
      include: this.updateIncludes,
    });
  }

  async delete(id: string) {
    return this.prisma.dailyWorkUpdate.delete({ where: { id } });
  }
}
