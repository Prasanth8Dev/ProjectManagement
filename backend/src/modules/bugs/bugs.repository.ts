import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { getPaginationParams } from '../../common/utils/pagination.util';

@Injectable()
export class BugsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private get bugIncludes() {
    return {
      project: { select: { id: true, name: true, color: true, slug: true } },
      assignee: { select: { id: true, name: true, avatar: true, email: true } },
      reporter: { select: { id: true, name: true, avatar: true, email: true } },
      linkedTask: { select: { id: true, title: true, status: true } },
    };
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    severity?: string;
    priority?: string;
    platform?: string;
    projectId?: string;
    assigneeId?: string;
    reporterId?: string;
    isArchived?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page,
      limit,
      search,
      status,
      severity,
      priority,
      platform,
      projectId,
      assigneeId,
      reporterId,
      isArchived = false,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Prisma.BugWhereInput = {
      isArchived,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status: status as any }),
      ...(severity && { severity: severity as any }),
      ...(priority && { priority: priority as any }),
      ...(platform && { platform: platform as any }),
      ...(projectId && { projectId }),
      ...(assigneeId && { assigneeId }),
      ...(reporterId && { reporterId }),
    };

    const [bugs, total] = await Promise.all([
      this.prisma.bug.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: this.bugIncludes,
      }),
      this.prisma.bug.count({ where }),
    ]);

    return { bugs, total };
  }

  async findById(id: string) {
    return this.prisma.bug.findUnique({
      where: { id },
      include: this.bugIncludes,
    });
  }

  async create(data: Prisma.BugCreateInput) {
    return this.prisma.bug.create({
      data,
      include: this.bugIncludes,
    });
  }

  async update(id: string, data: Prisma.BugUncheckedUpdateInput) {
    return this.prisma.bug.update({
      where: { id },
      data,
      include: this.bugIncludes,
    });
  }

  async delete(id: string) {
    return this.prisma.bug.delete({ where: { id } });
  }
}
