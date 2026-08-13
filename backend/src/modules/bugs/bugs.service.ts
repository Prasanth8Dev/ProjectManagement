import { Injectable, NotFoundException } from '@nestjs/common';
import { BugsRepository } from './bugs.repository';
import { CreateBugDto } from './dto/create-bug.dto';
import { UpdateBugDto } from './dto/update-bug.dto';
import { BugFilterDto, AssignBugDto, ChangeBugStatusDto } from './dto/bug-filter.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class BugsService {
  constructor(private readonly bugsRepository: BugsRepository) {}

  async findAll(filterDto: BugFilterDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      severity,
      priority,
      platform,
      projectId,
      assigneeId,
      reporterId,
      isArchived,
      sortBy,
      sortOrder,
    } = filterDto;

    const { bugs, total } = await this.bugsRepository.findAll({
      page,
      limit,
      search,
      status,
      severity,
      priority,
      platform,
      projectId,
      assigneeId,
      reporterId,
      isArchived,
      sortBy,
      sortOrder,
    });

    return createPaginatedResponse(bugs, total, page, limit);
  }

  async findById(id: string) {
    const bug = await this.bugsRepository.findById(id);
    if (!bug) throw new NotFoundException(`Bug with id ${id} not found`);
    return bug;
  }

  async create(dto: CreateBugDto) {
    return this.bugsRepository.create({
      title: dto.title,
      description: dto.description,
      stepsToReproduce: dto.stepsToReproduce,
      expectedBehavior: dto.expectedBehavior,
      actualBehavior: dto.actualBehavior,
      environment: dto.environment,
      status: dto.status ?? 'OPEN',
      severity: dto.severity ?? 'MEDIUM',
      priority: dto.priority ?? 'MEDIUM',
      platform: dto.platform,
      reporter: { connect: { id: dto.reporterId } },
      ...(dto.projectId && { project: { connect: { id: dto.projectId } } }),
      ...(dto.assigneeId && { assignee: { connect: { id: dto.assigneeId } } }),
    });
  }

  async update(id: string, dto: UpdateBugDto) {
    await this.findById(id);
    const data: Record<string, unknown> = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.stepsToReproduce !== undefined) data.stepsToReproduce = dto.stepsToReproduce;
    if (dto.expectedBehavior !== undefined) data.expectedBehavior = dto.expectedBehavior;
    if (dto.actualBehavior !== undefined) data.actualBehavior = dto.actualBehavior;
    if (dto.environment !== undefined) data.environment = dto.environment;
    if (dto.severity !== undefined) data.severity = dto.severity;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.platform !== undefined) data.platform = dto.platform;
    if (dto.isArchived !== undefined) data.isArchived = dto.isArchived;
    if (dto.projectId !== undefined) data.projectId = dto.projectId ?? null;
    if (dto.assigneeId !== undefined) data.assigneeId = dto.assigneeId ?? null;

    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === 'RESOLVED') {
        data.resolvedAt = new Date();
      } else if (dto.status === 'CLOSED' || dto.status === 'WONT_FIX') {
        data.closedAt = new Date();
      } else if (dto.status === 'REOPENED' || dto.status === 'OPEN') {
        // Going back to an open state clears any prior resolution/closure timestamps.
        data.resolvedAt = null;
        data.closedAt = null;
      }
    }

    return this.bugsRepository.update(id, data as any);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.bugsRepository.delete(id);
  }

  async assign(id: string, dto: AssignBugDto) {
    await this.findById(id);
    return this.bugsRepository.update(id, { assigneeId: dto.assigneeId ?? null } as any);
  }

  async changeStatus(id: string, dto: ChangeBugStatusDto) {
    await this.findById(id);
    const data: Record<string, unknown> = { status: dto.status };
    if (dto.status === 'RESOLVED') data.resolvedAt = new Date();
    if (dto.status === 'CLOSED' || dto.status === 'WONT_FIX') data.closedAt = new Date();
    if (dto.status === 'REOPENED' || dto.status === 'OPEN') {
      data.resolvedAt = null;
      data.closedAt = null;
    }
    return this.bugsRepository.update(id, data as any);
  }
}
