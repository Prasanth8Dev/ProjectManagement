import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { LabelsRepository } from './labels.repository';
import { CreateLabelDto, UpdateLabelDto } from './dto/label.dto';

@Injectable()
export class LabelsService {
  constructor(private readonly labelsRepository: LabelsRepository) {}

  async findByProjectId(projectId: string) {
    return this.labelsRepository.findByProjectId(projectId);
  }

  async create(projectId: string, createDto: CreateLabelDto) {
    const existing = await this.labelsRepository.findByProjectAndName(projectId, createDto.name);
    if (existing) {
      throw new ConflictException(`Label "${createDto.name}" already exists in this project`);
    }
    return this.labelsRepository.create(projectId, createDto.name, createDto.color || '#6366f1');
  }

  async update(id: string, updateDto: UpdateLabelDto) {
    const label = await this.labelsRepository.findById(id);
    if (!label) {
      throw new NotFoundException(`Label with id ${id} not found`);
    }
    return this.labelsRepository.update(id, updateDto);
  }

  async delete(id: string) {
    const label = await this.labelsRepository.findById(id);
    if (!label) {
      throw new NotFoundException(`Label with id ${id} not found`);
    }
    return this.labelsRepository.delete(id);
  }

  async attachToTask(taskId: string, labelId: string) {
    const label = await this.labelsRepository.findById(labelId);
    if (!label) {
      throw new NotFoundException(`Label with id ${labelId} not found`);
    }
    const existing = await this.labelsRepository.isAttached(taskId, labelId);
    if (existing) {
      throw new ConflictException('Label is already attached to this task');
    }
    return this.labelsRepository.attachToTask(taskId, labelId);
  }

  async detachFromTask(taskId: string, labelId: string) {
    const attached = await this.labelsRepository.isAttached(taskId, labelId);
    if (!attached) {
      throw new NotFoundException('Label is not attached to this task');
    }
    return this.labelsRepository.detachFromTask(taskId, labelId);
  }
}
