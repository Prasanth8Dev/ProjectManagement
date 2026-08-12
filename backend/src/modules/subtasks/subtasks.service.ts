import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SubtasksRepository } from './subtasks.repository';
import { TasksService } from '../tasks/tasks.service';
import { CreateSubtaskDto, UpdateSubtaskDto } from './dto/create-subtask.dto';

@Injectable()
export class SubtasksService {
  constructor(
    private readonly subtasksRepository: SubtasksRepository,
    private readonly tasksService: TasksService,
  ) {}

  async findByParentId(parentTaskId: string) {
    await this.tasksService.findById(parentTaskId);
    return this.subtasksRepository.findByParentId(parentTaskId);
  }

  async create(parentTaskId: string, createSubtaskDto: CreateSubtaskDto) {
    const parentTask = await this.tasksService.findById(parentTaskId);
    const maxPos = await this.subtasksRepository.getMaxPosition(parentTask.projectId);

    return this.subtasksRepository.create({
      title: createSubtaskDto.title,
      description: createSubtaskDto.description,
      status: createSubtaskDto.status || 'TODO',
      priority: createSubtaskDto.priority || 'MEDIUM',
      estimatedHours: createSubtaskDto.estimatedHours,
      dueDate: createSubtaskDto.dueDate ? new Date(createSubtaskDto.dueDate) : undefined,
      position: maxPos + 1,
      project: { connect: { id: parentTask.projectId } },
      parentTask: { connect: { id: parentTaskId } },
      ...(createSubtaskDto.assigneeId && {
        assignee: { connect: { id: createSubtaskDto.assigneeId } },
      }),
    });
  }

  async update(id: string, updateSubtaskDto: UpdateSubtaskDto) {
    const subtask = await this.subtasksRepository.findById(id);
    if (!subtask) {
      throw new NotFoundException(`Subtask with id ${id} not found`);
    }

    const updateData: Prisma.TaskUncheckedUpdateInput = {};
    if (updateSubtaskDto.title !== undefined) updateData.title = updateSubtaskDto.title;
    if (updateSubtaskDto.description !== undefined) updateData.description = updateSubtaskDto.description;
    if (updateSubtaskDto.status !== undefined) updateData.status = updateSubtaskDto.status;
    if (updateSubtaskDto.priority !== undefined) updateData.priority = updateSubtaskDto.priority;
    if (updateSubtaskDto.assigneeId !== undefined) updateData.assigneeId = updateSubtaskDto.assigneeId || null;
    if (updateSubtaskDto.dueDate !== undefined) {
      updateData.dueDate = updateSubtaskDto.dueDate ? new Date(updateSubtaskDto.dueDate) : null;
    }
    if (updateSubtaskDto.estimatedHours !== undefined) updateData.estimatedHours = updateSubtaskDto.estimatedHours;

    return this.subtasksRepository.update(id, updateData);
  }

  async delete(id: string) {
    const subtask = await this.subtasksRepository.findById(id);
    if (!subtask) {
      throw new NotFoundException(`Subtask with id ${id} not found`);
    }
    return this.subtasksRepository.delete(id);
  }

  async toggleComplete(id: string) {
    const subtask = await this.subtasksRepository.findById(id);
    if (!subtask) {
      throw new NotFoundException(`Subtask with id ${id} not found`);
    }
    const newStatus = subtask.status === 'DONE' ? 'TODO' : 'DONE';
    return this.subtasksRepository.update(id, {
      status: newStatus,
      completedAt: newStatus === 'DONE' ? new Date() : null,
    });
  }
}
