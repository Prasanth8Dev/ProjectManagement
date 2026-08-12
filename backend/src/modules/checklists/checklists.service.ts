import { Injectable, NotFoundException } from '@nestjs/common';
import { ChecklistsRepository } from './checklists.repository';
import { TasksService } from '../tasks/tasks.service';
import {
  CreateChecklistItemDto,
  UpdateChecklistItemDto,
  ReorderChecklistDto,
} from './dto/checklist.dto';

@Injectable()
export class ChecklistsService {
  constructor(
    private readonly checklistsRepository: ChecklistsRepository,
    private readonly tasksService: TasksService,
  ) {}

  async findByTaskId(taskId: string) {
    await this.tasksService.findById(taskId);
    return this.checklistsRepository.findByTaskId(taskId);
  }

  async create(taskId: string, createDto: CreateChecklistItemDto) {
    await this.tasksService.findById(taskId);
    const maxPos = await this.checklistsRepository.getMaxPosition(taskId);

    return this.checklistsRepository.create({
      title: createDto.title,
      position: createDto.position ?? maxPos + 1,
      task: { connect: { id: taskId } },
    });
  }

  async update(id: string, updateDto: UpdateChecklistItemDto) {
    const item = await this.checklistsRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Checklist item with id ${id} not found`);
    }

    const updateData: Record<string, unknown> = {};
    if (updateDto.title !== undefined) updateData.title = updateDto.title;
    if (updateDto.position !== undefined) updateData.position = updateDto.position;
    if (updateDto.isCompleted !== undefined) {
      updateData.isCompleted = updateDto.isCompleted;
      updateData.completedAt = updateDto.isCompleted ? new Date() : null;
    }

    return this.checklistsRepository.update(id, updateData);
  }

  async delete(id: string) {
    const item = await this.checklistsRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Checklist item with id ${id} not found`);
    }
    return this.checklistsRepository.delete(id);
  }

  async reorder(taskId: string, reorderDto: ReorderChecklistDto) {
    await this.tasksService.findById(taskId);
    await this.checklistsRepository.reorder(reorderDto.items);
    return this.checklistsRepository.findByTaskId(taskId);
  }
}
