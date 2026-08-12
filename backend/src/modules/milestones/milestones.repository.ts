import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MilestonesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProjectId(projectId: string) {
    return this.prisma.milestone.findMany({
      where: { projectId },
      include: {
        _count: { select: { tasks: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.milestone.findUnique({
      where: { id },
      include: {
        _count: { select: { tasks: true } },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            assignee: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });
  }

  async create(projectId: string, data: Omit<Prisma.MilestoneCreateInput, 'project'>) {
    return this.prisma.milestone.create({
      data: {
        ...data,
        project: { connect: { id: projectId } },
      },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async update(id: string, data: Prisma.MilestoneUpdateInput) {
    return this.prisma.milestone.update({
      where: { id },
      data,
      include: { _count: { select: { tasks: true } } },
    });
  }

  async delete(id: string) {
    return this.prisma.milestone.delete({ where: { id } });
  }
}
