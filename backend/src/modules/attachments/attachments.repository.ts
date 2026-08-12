import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AttachmentEntityType } from '@prisma/client';

@Injectable()
export class AttachmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    uploadedBy: string;
    taskId?: string;
    projectId?: string;
    fileName: string;
    fileKey: string;
    fileUrl: string;
    mimeType: string;
    fileSize: number;
    entityType: AttachmentEntityType;
  }) {
    return this.prisma.attachment.create({
      data: {
        uploader: { connect: { id: data.uploadedBy } },
        fileName: data.fileName,
        fileKey: data.fileKey,
        fileUrl: data.fileUrl,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        entityType: data.entityType,
        ...(data.taskId && { task: { connect: { id: data.taskId } } }),
        ...(data.projectId && { project: { connect: { id: data.projectId } } }),
      },
      include: {
        uploader: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.attachment.findUnique({
      where: { id },
      include: {
        uploader: { select: { id: true, name: true } },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.attachment.delete({ where: { id } });
  }
}
