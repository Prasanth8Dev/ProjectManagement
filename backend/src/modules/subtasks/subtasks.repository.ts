import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubtasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByParentId(parentTaskId: string) {
    return this.prisma.task.findMany({
      where: { parentTaskId, isArchived: false },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        _count: { select: { checklistItems: true, comments: true } },
      },
      orderBy: { position: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  async create(data: Prisma.TaskCreateInput) {
    return this.prisma.task.create({
      data,
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  async update(id: string, data: Prisma.TaskUncheckedUpdateInput) {
    return this.prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }

  async getMaxPosition(projectId: string): Promise<number> {
    const result = await this.prisma.task.aggregate({
      where: { projectId },
      _max: { position: true },
    });
    return result._max.position ?? 0;
  }
}
