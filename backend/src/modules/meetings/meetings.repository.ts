import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MeetingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private get meetingIncludes() {
    return {
      organizer: { select: { id: true, name: true, avatar: true, email: true } },
      participants: {
        include: { user: { select: { id: true, name: true, avatar: true, email: true } } },
      },
      _count: { select: { actionItems: true } },
    };
  }

  private get actionItemIncludes() {
    return {
      assignee: { select: { id: true, name: true, avatar: true, email: true } },
      task: { select: { id: true, title: true, status: true } },
      _count: { select: { comments: true } },
    };
  }

  async findAllForProject(projectId: string, type?: string) {
    return this.prisma.meeting.findMany({
      where: { projectId, ...(type && { type: type as any }) },
      include: this.meetingIncludes,
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.meeting.findUnique({
      where: { id },
      include: {
        ...this.meetingIncludes,
        project: { select: { id: true, name: true, color: true, slug: true } },
        actionItems: {
          include: this.actionItemIncludes,
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async create(data: {
    projectId: string;
    title: string;
    type?: string;
    scheduledAt: Date;
    duration?: number;
    organizerId?: string;
    description?: string;
    participantIds?: string[];
  }) {
    const { participantIds, ...rest } = data;
    return this.prisma.meeting.create({
      data: {
        ...rest,
        ...(participantIds?.length && {
          participants: {
            create: participantIds.map((userId) => ({ userId })),
          },
        }),
      } as Prisma.MeetingUncheckedCreateInput,
      include: this.meetingIncludes,
    });
  }

  async update(id: string, data: Prisma.MeetingUncheckedUpdateInput) {
    return this.prisma.meeting.update({
      where: { id },
      data,
      include: this.meetingIncludes,
    });
  }

  async replaceParticipants(id: string, participantIds: string[]) {
    await this.prisma.meetingParticipant.deleteMany({ where: { meetingId: id } });
    if (participantIds.length) {
      await this.prisma.meetingParticipant.createMany({
        data: participantIds.map((userId) => ({ meetingId: id, userId })),
        skipDuplicates: true,
      });
    }
  }

  async delete(id: string) {
    return this.prisma.meeting.delete({ where: { id } });
  }

  // --- Action items ---

  async findActionItemById(id: string) {
    return this.prisma.meetingActionItem.findUnique({
      where: { id },
      include: {
        ...this.actionItemIncludes,
        meeting: { select: { id: true, title: true, projectId: true, organizerId: true } },
      },
    });
  }

  async createActionItem(data: {
    meetingId: string;
    title: string;
    description?: string;
    assigneeId?: string;
    priority?: string;
    dueDate?: Date;
  }) {
    return this.prisma.meetingActionItem.create({
      data: data as Prisma.MeetingActionItemUncheckedCreateInput,
      include: this.actionItemIncludes,
    });
  }

  async updateActionItem(id: string, data: Prisma.MeetingActionItemUncheckedUpdateInput) {
    return this.prisma.meetingActionItem.update({
      where: { id },
      data,
      include: this.actionItemIncludes,
    });
  }

  async deleteActionItem(id: string) {
    return this.prisma.meetingActionItem.delete({ where: { id } });
  }

  async findActionItemsDueSoon(hoursAhead: number) {
    const now = new Date();
    const threshold = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
    return this.prisma.meetingActionItem.findMany({
      where: {
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        assigneeId: { not: null },
        dueDate: { gte: now, lte: threshold },
      },
      include: this.actionItemIncludes,
    });
  }
}
