import { Injectable, NotFoundException } from '@nestjs/common';
import { MilestonesRepository } from './milestones.repository';
import { CreateMilestoneDto, UpdateMilestoneDto } from './dto/milestone.dto';

@Injectable()
export class MilestonesService {
  constructor(private readonly milestonesRepository: MilestonesRepository) {}

  async findByProjectId(projectId: string) {
    return this.milestonesRepository.findByProjectId(projectId);
  }

  async findById(id: string) {
    const milestone = await this.milestonesRepository.findById(id);
    if (!milestone) {
      throw new NotFoundException(`Milestone with id ${id} not found`);
    }
    return milestone;
  }

  async create(projectId: string, createDto: CreateMilestoneDto) {
    try {
      return await this.milestonesRepository.create(projectId, {
        name: createDto.name,
        description: createDto.description,
        dueDate: new Date(createDto.dueDate),
        status: createDto.status || 'PENDING',
      });
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateMilestoneDto) {
    await this.findById(id);
    const updateData: Record<string, unknown> = {};
    if (updateDto.name !== undefined) updateData.name = updateDto.name;
    if (updateDto.description !== undefined) updateData.description = updateDto.description;
    if (updateDto.status !== undefined) {
      updateData.status = updateDto.status;
      if (updateDto.status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    }
    if (updateDto.dueDate !== undefined) updateData.dueDate = new Date(updateDto.dueDate);

    return this.milestonesRepository.update(id, updateData);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.milestonesRepository.delete(id);
  }
}
