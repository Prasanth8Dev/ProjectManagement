import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTaskId(taskId: string) {
    return this.prisma.comment.findMany({
      where: { taskId, parentId: null },
      include: {
        author: { select: { id: true, name: true, avatar: true, email: true } },
        replies: {
          include: {
            author: { select: { id: true, name: true, avatar: true, email: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  async create(data: {
    taskId: string;
    authorId: string;
    content: string;
    parentId?: string;
  }) {
    return this.prisma.comment.create({
      data: {
        content: data.content,
        task: { connect: { id: data.taskId } },
        author: { connect: { id: data.authorId } },
        ...(data.parentId && { parent: { connect: { id: data.parentId } } }),
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        replies: true,
      },
    });
  }

  async update(id: string, content: string) {
    return this.prisma.comment.update({
      where: { id },
      data: { content, isEdited: true, editedAt: new Date() },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.comment.delete({ where: { id } });
  }
}
