import { Injectable, NotFoundException } from '@nestjs/common';
import { KanbanRepository } from './kanban.repository';
import { ActivityService } from '../activity/activity.service';
import { MoveCardDto } from './dto/kanban.dto';
import { TaskStatus } from '@prisma/client';
import { ProjectsService } from '../projects/projects.service';

const KANBAN_STATUSES: TaskStatus[] = [
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'TESTING',
  'DONE',
];

@Injectable()
export class KanbanService {
  constructor(
    private readonly kanbanRepository: KanbanRepository,
    private readonly activityService: ActivityService,
    private readonly projectsService: ProjectsService,
  ) {}

  async getBoard(projectId: string) {
    await this.projectsService.findById(projectId);
    const tasks = await this.kanbanRepository.getBoardTasks(projectId);

    // Group tasks by status and enrich with checklist progress
    const columns: Record<string, unknown[]> = {};
    for (const status of KANBAN_STATUSES) {
      columns[status] = [];
    }

    for (const task of tasks) {
      const totalChecklist = task.checklistItems.length;
      const completedChecklist = task.checklistItems.filter((c) => c.isCompleted).length;

      const enriched = {
        id: task.id,
        title: task.title,
        priority: task.priority,
        status: task.status,
        position: task.position,
        dueDate: task.dueDate,
        assignee: task.assignee,
        labels: task.labels.map((tl) => tl.label),
        checklistProgress: { completed: completedChecklist, total: totalChecklist },
        commentCount: task._count.comments,
        subtaskCount: task._count.subtasks,
      };

      if (columns[task.status]) {
        (columns[task.status] as unknown[]).push(enriched);
      }
    }

    return { projectId, columns };
  }

  async moveCard(dto: MoveCardDto) {
    // Find the task
    const task = await this.kanbanRepository.findTaskById(dto.taskId);
    if (!task) {
      throw new NotFoundException(`Task with id ${dto.taskId} not found`);
    }

    const oldStatus = task.status;
    const maxPos = await this.kanbanRepository.getMaxPosition(task.projectId, dto.newStatus);
    const newPosition = dto.newPosition ?? maxPos + 1;

    await this.kanbanRepository.updateTaskStatusAndPosition(
      dto.taskId,
      dto.newStatus,
      newPosition,
    );

    if (oldStatus !== dto.newStatus && dto.actorUserId) {
      await this.kanbanRepository.createHistory({
        taskId: dto.taskId,
        userId: dto.actorUserId,
        field: 'status',
        oldValue: oldStatus,
        newValue: dto.newStatus,
      });

      await this.activityService.logActivity({
        userId: dto.actorUserId,
        projectId: task.projectId,
        taskId: dto.taskId,
        action: 'STATUS_CHANGED',
        entityType: 'Task',
        entityId: dto.taskId,
        entityTitle: task.title,
        metadata: { from: oldStatus, to: dto.newStatus, via: 'kanban' },
      });
    }

    return {
      taskId: dto.taskId,
      newStatus: dto.newStatus,
      newPosition,
    };
  }
}
