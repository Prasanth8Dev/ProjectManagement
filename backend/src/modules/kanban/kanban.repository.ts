import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class KanbanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getBoardTasks(projectId: string) {
    return this.prisma.task.findMany({
      where: {
        projectId,
        isArchived: false,
        parentTaskId: null,
        status: { not: 'CANCELLED' },
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        labels: {
          include: { label: { select: { id: true, name: true, color: true } } },
        },
        // Load completed items inline to avoid N+1 queries
        checklistItems: { select: { isCompleted: true } },
        _count: {
          select: {
            comments: true,
            subtasks: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    });
  }

  async updateTaskStatusAndPosition(
    taskId: string,
    newStatus: TaskStatus,
    newPosition: number,
  ) {
    return this.prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus, position: newPosition },
    });
  }

  async getMaxPosition(projectId: string, status: TaskStatus): Promise<number> {
    const result = await this.prisma.task.aggregate({
      where: { projectId, status },
      _max: { position: true },
    });
    return result._max.position ?? 0;
  }

  async createHistory(data: {
    taskId: string;
    userId: string;
    field: string;
    oldValue?: string;
    newValue?: string;
  }) {
    return this.prisma.taskHistory.create({ data });
  }

  async findTaskById(id: string) {
    return this.prisma.task.findUnique({ where: { id } });
  }
}
