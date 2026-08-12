import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ProjectsRepository } from './projects.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectFilterDto } from './dto/project-filter.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { generateSlug } from '../../common/utils/slug.util';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async findAll(filterDto: ProjectFilterDto) {
    const { page = 1, limit = 20, search, status, priority, isArchived, teamId, sortBy, sortOrder } = filterDto;
    const { projects, total } = await this.projectsRepository.findAll({
      page,
      limit,
      search,
      status,
      priority,
      isArchived,
      teamId,
      sortBy,
      sortOrder,
    });
    return createPaginatedResponse(projects, total, page, limit);
  }

  async findById(id: string) {
    const project = await this.projectsRepository.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }
    return project;
  }

  async create(createProjectDto: CreateProjectDto) {
    try {
      const slug = generateSlug(createProjectDto.name);
      const existing = await this.projectsRepository.findBySlug(slug);
      const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

      return await this.projectsRepository.create({
        name: createProjectDto.name,
        slug: finalSlug,
        description: createProjectDto.description,
        status: createProjectDto.status || 'PLANNING',
        priority: createProjectDto.priority || 'MEDIUM',
        color: createProjectDto.color || '#6366f1',
        icon: createProjectDto.icon,
        startDate: createProjectDto.startDate ? new Date(createProjectDto.startDate) : undefined,
        endDate: createProjectDto.endDate ? new Date(createProjectDto.endDate) : undefined,
      });
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    await this.findById(id);
    try {
      const updateData: Record<string, unknown> = { ...updateProjectDto };
      if (updateProjectDto.startDate) {
        updateData.startDate = new Date(updateProjectDto.startDate);
      }
      if (updateProjectDto.endDate) {
        updateData.endDate = new Date(updateProjectDto.endDate);
      }
      if (updateProjectDto.name) {
        const slug = generateSlug(updateProjectDto.name);
        const existing = await this.projectsRepository.findBySlug(slug);
        if (!existing || existing.id === id) {
          updateData.slug = slug;
        }
      }
      return await this.projectsRepository.update(id, updateData);
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string) {
    await this.findById(id);
    return this.projectsRepository.delete(id);
  }

  async toggleArchive(id: string) {
    const project = await this.findById(id);
    return this.projectsRepository.update(id, {
      isArchived: !project.isArchived,
      archivedAt: !project.isArchived ? new Date() : null,
    });
  }

  async getStats(id: string) {
    await this.findById(id);
    return this.projectsRepository.getStats(id);
  }

  async addMember(projectId: string, addMemberDto: AddProjectMemberDto) {
    await this.findById(projectId);
    const existing = await this.projectsRepository.findMember(projectId, addMemberDto.userId);
    if (existing) {
      throw new ConflictException('User is already a member of this project');
    }
    return this.projectsRepository.addMember(
      projectId,
      addMemberDto.userId,
      addMemberDto.role || 'DEVELOPER',
    );
  }

  async removeMember(projectId: string, userId: string) {
    await this.findById(projectId);
    const member = await this.projectsRepository.findMember(projectId, userId);
    if (!member) {
      throw new NotFoundException('User is not a member of this project');
    }
    return this.projectsRepository.removeMember(projectId, userId);
  }

  async getActivity(projectId: string, paginationDto: PaginationDto) {
    await this.findById(projectId);
    const { page = 1, limit = 20 } = paginationDto;
    const { activity, total } = await this.projectsRepository.getActivity({
      projectId,
      page,
      limit,
    });
    return createPaginatedResponse(activity, total, page, limit);
  }
}
