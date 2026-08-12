import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { TeamsRepository } from './teams.repository';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddMemberDto, UpdateMemberRoleDto } from './dto/add-member.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { generateSlug } from '../../common/utils/slug.util';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class TeamsService {
  constructor(private readonly teamsRepository: TeamsRepository) {}

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 20, search, sortBy, sortOrder } = paginationDto;
    const { teams, total } = await this.teamsRepository.findAll({
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });
    return createPaginatedResponse(teams, total, page, limit);
  }

  async findById(id: string) {
    const team = await this.teamsRepository.findById(id);
    if (!team) {
      throw new NotFoundException(`Team with id ${id} not found`);
    }
    return team;
  }

  async create(createTeamDto: CreateTeamDto) {
    try {
      const slug = generateSlug(createTeamDto.name);
      const existing = await this.teamsRepository.findBySlug(slug);
      const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

      return await this.teamsRepository.create({
        name: createTeamDto.name,
        slug: finalSlug,
        description: createTeamDto.description,
        color: createTeamDto.color || '#6366f1',
        avatar: createTeamDto.avatar,
      });
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateTeamDto: UpdateTeamDto) {
    await this.findById(id);
    try {
      const updateData: Record<string, unknown> = { ...updateTeamDto };
      if (updateTeamDto.name) {
        const slug = generateSlug(updateTeamDto.name);
        const existing = await this.teamsRepository.findBySlug(slug);
        if (!existing || existing.id === id) {
          updateData.slug = slug;
        }
      }
      return await this.teamsRepository.update(id, updateData);
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string) {
    await this.findById(id);
    return this.teamsRepository.delete(id);
  }

  async addMember(teamId: string, addMemberDto: AddMemberDto) {
    await this.findById(teamId);
    const existing = await this.teamsRepository.findMember(teamId, addMemberDto.userId);
    if (existing) {
      throw new ConflictException('User is already a member of this team');
    }
    return this.teamsRepository.addMember(teamId, addMemberDto.userId, addMemberDto.role || 'MEMBER');
  }

  async removeMember(teamId: string, userId: string) {
    await this.findById(teamId);
    const member = await this.teamsRepository.findMember(teamId, userId);
    if (!member) {
      throw new NotFoundException('User is not a member of this team');
    }
    return this.teamsRepository.removeMember(teamId, userId);
  }

  async updateMemberRole(teamId: string, userId: string, dto: UpdateMemberRoleDto) {
    await this.findById(teamId);
    const member = await this.teamsRepository.findMember(teamId, userId);
    if (!member) {
      throw new NotFoundException('User is not a member of this team');
    }
    return this.teamsRepository.updateMemberRole(teamId, userId, dto.role);
  }

  async linkProject(teamId: string, projectId: string) {
    await this.findById(teamId);
    const existing = await this.teamsRepository.findProjectLink(teamId, projectId);
    if (existing) {
      throw new ConflictException('Project is already linked to this team');
    }
    return this.teamsRepository.linkProject(teamId, projectId);
  }

  async unlinkProject(teamId: string, projectId: string) {
    await this.findById(teamId);
    const existing = await this.teamsRepository.findProjectLink(teamId, projectId);
    if (!existing) {
      throw new NotFoundException('Project is not linked to this team');
    }
    return this.teamsRepository.unlinkProject(teamId, projectId);
  }
}
