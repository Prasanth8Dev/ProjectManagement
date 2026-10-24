import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InterventionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private get includes() {
    return {
      employee: { select: { id: true, name: true, avatar: true, email: true } },
      manager: { select: { id: true, name: true, avatar: true, email: true } },
      task: { select: { id: true, title: true } },
      bug: { select: { id: true, title: true } },
    };
  }

  async createForTask(data: {
    taskId: string;
    employeeId: string;
    managerId: string;
    note: string;
  }) {
    return this.prisma.intervention.create({
      data,
      include: this.includes,
    });
  }

  async createForBug(data: {
    bugId: string;
    employeeId: string;
    managerId: string;
    note: string;
  }) {
    return this.prisma.intervention.create({
      data,
      include: this.includes,
    });
  }

  async findByTaskId(taskId: string) {
    return this.prisma.intervention.findMany({
      where: { taskId },
      include: this.includes,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByBugId(bugId: string) {
    return this.prisma.intervention.findMany({
      where: { bugId },
      include: this.includes,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEmployeeId(employeeId: string) {
    return this.prisma.intervention.findMany({
      where: { employeeId },
      include: this.includes,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countByEmployeeId(employeeId: string) {
    return this.prisma.intervention.count({ where: { employeeId } });
  }

  async countByEmployeeIds(employeeIds: string[]) {
    const rows = await this.prisma.intervention.groupBy({
      by: ['employeeId'],
      where: { employeeId: { in: employeeIds } },
      _count: { _all: true },
    });
    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.employeeId] = row._count._all;
      return acc;
    }, {});
  }
}
