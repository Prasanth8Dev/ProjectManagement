import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LabelsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProjectId(projectId: string) {
    return this.prisma.label.findMany({
      where: { projectId },
      include: { _count: { select: { tasks: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.label.findUnique({
      where: { id },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async findByProjectAndName(projectId: string, name: string) {
    return this.prisma.label.findUnique({
      where: { projectId_name: { projectId, name } },
    });
  }

  async create(projectId: string, name: string, color: string) {
    return this.prisma.label.create({
      data: { name, color, project: { connect: { id: projectId } } },
    });
  }

  async update(id: string, data: { name?: string; color?: string }) {
    return this.prisma.label.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.label.delete({ where: { id } });
  }

  async attachToTask(taskId: string, labelId: string) {
    return this.prisma.taskLabel.create({
      data: { taskId, labelId },
    });
  }

  async detachFromTask(taskId: string, labelId: string) {
    return this.prisma.taskLabel.delete({
      where: { taskId_labelId: { taskId, labelId } },
    });
  }

  async isAttached(taskId: string, labelId: string) {
    return this.prisma.taskLabel.findUnique({
      where: { taskId_labelId: { taskId, labelId } },
    });
  }
}
