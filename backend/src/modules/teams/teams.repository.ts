import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, TeamMemberRole } from '@prisma/client';
import { getPaginationParams } from '../../common/utils/pagination.util';

@Injectable()
export class TeamsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Prisma.TeamWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [teams, total] = await Promise.all([
      this.prisma.team.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { members: true, projects: true },
          },
        },
      }),
      this.prisma.team.count({ where }),
    ]);

    return { teams, total };
  }

  async findById(id: string) {
    return this.prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                jobTitle: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        projects: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
                color: true,
                icon: true,
              },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.team.findUnique({ where: { slug } });
  }

  async create(data: Prisma.TeamCreateInput) {
    return this.prisma.team.create({
      data,
      include: {
        _count: { select: { members: true } },
      },
    });
  }

  async update(id: string, data: Prisma.TeamUpdateInput) {
    return this.prisma.team.update({
      where: { id },
      data,
      include: {
        _count: { select: { members: true } },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.team.delete({ where: { id } });
  }

  async findMember(teamId: string, userId: string) {
    return this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
  }

  async addMember(teamId: string, userId: string, role: TeamMemberRole) {
    return this.prisma.teamMember.create({
      data: { teamId, userId, role },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });
  }

  async removeMember(teamId: string, userId: string) {
    return this.prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId } },
    });
  }

  async updateMemberRole(teamId: string, userId: string, role: TeamMemberRole) {
    return this.prisma.teamMember.update({
      where: { teamId_userId: { teamId, userId } },
      data: { role },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });
  }

  async findProjectLink(teamId: string, projectId: string) {
    return this.prisma.projectTeam.findUnique({
      where: { projectId_teamId: { projectId, teamId } },
    });
  }

  async linkProject(teamId: string, projectId: string) {
    return this.prisma.projectTeam.create({
      data: { teamId, projectId },
      include: {
        project: { select: { id: true, name: true, slug: true, status: true, color: true, icon: true } },
      },
    });
  }

  async unlinkProject(teamId: string, projectId: string) {
    return this.prisma.projectTeam.delete({
      where: { projectId_teamId: { projectId, teamId } },
    });
  }
}
