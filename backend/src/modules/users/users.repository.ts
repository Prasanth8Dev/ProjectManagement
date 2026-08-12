import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, UserRole, UserStatus, TaskStatus } from '@prisma/client';
import { getPaginationParams } from '../../common/utils/pagination.util';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    role?: UserRole;
    status?: UserStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, search, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Prisma.UserWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { jobTitle: { contains: search, mode: 'insensitive' } },
          { department: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(role && { role }),
      ...(status && { status }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              teamMemberships: true,
              projectMemberships: true,
              assignedTasks: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        teamMemberships: {
          include: {
            team: true,
          },
        },
        projectMemberships: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
                color: true,
                icon: true,
              },
            },
          },
        },
        assignedTasks: {
          where: {
            isArchived: false,
            status: { not: 'DONE' },
          },
          take: 10,
          orderBy: { updatedAt: 'desc' },
          include: {
            project: {
              select: { id: true, name: true, color: true },
            },
          },
        },
        _count: {
          select: {
            assignedTasks: true,
            reportedTasks: true,
            comments: true,
            dailyUpdates: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
      // passwordHash is stripped in the service before returning to the client
      include: {
        _count: {
          select: {
            teamMemberships: true,
            projectMemberships: true,
            assignedTasks: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async getUserTasks(params: {
    userId: string;
    page: number;
    limit: number;
    status?: TaskStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { userId, page, limit, status, sortBy = 'updatedAt', sortOrder = 'desc' } = params;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Prisma.TaskWhereInput = {
      assigneeId: userId,
      isArchived: false,
      ...(status && { status }),
    };

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          project: { select: { id: true, name: true, color: true } },
          milestone: { select: { id: true, name: true } },
          labels: {
            include: { label: { select: { id: true, name: true, color: true } } },
          },
          _count: {
            select: { subtasks: true, comments: true, checklistItems: true },
          },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return { tasks, total };
  }

  async getUserActivity(params: {
    userId: string;
    page: number;
    limit: number;
  }) {
    const { userId, page, limit } = params;
    const { skip, take } = getPaginationParams(page, limit);

    const [activity, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          project: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
        },
      }),
      this.prisma.activityLog.count({ where: { userId } }),
    ]);

    return { activity, total };
  }
}
