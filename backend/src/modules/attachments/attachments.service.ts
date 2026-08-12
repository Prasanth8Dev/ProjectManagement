import { Injectable, NotFoundException } from '@nestjs/common';
import { AttachmentsRepository } from './attachments.repository';
import { UploadAttachmentDto } from './dto/attachment.dto';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class AttachmentsService {
  private readonly uploadDir: string;

  constructor(private readonly attachmentsRepository: AttachmentsRepository) {
    this.uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
  }

  async upload(file: Express.Multer.File, dto: UploadAttachmentDto) {
    try {
      const fileKey = `${uuidv4()}${path.extname(file.originalname)}`;
      const filePath = path.join(this.uploadDir, fileKey);

      // Write file to disk
      fs.writeFileSync(filePath, file.buffer);

      const fileUrl = `/api/v1/attachments/files/${fileKey}`;

      return await this.attachmentsRepository.create({
        uploadedBy: dto.uploadedBy,
        taskId: dto.taskId,
        projectId: dto.projectId,
        fileName: file.originalname,
        fileKey,
        fileUrl,
        mimeType: file.mimetype,
        fileSize: file.size,
        entityType: dto.entityType,
      });
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string) {
    const attachment = await this.attachmentsRepository.findById(id);
    if (!attachment) {
      throw new NotFoundException(`Attachment with id ${id} not found`);
    }
    return attachment;
  }

  async getFilePath(id: string): Promise<string> {
    const attachment = await this.findById(id);
    const filePath = path.join(this.uploadDir, attachment.fileKey);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found on disk');
    }
    return filePath;
  }

  async delete(id: string) {
    const attachment = await this.findById(id);
    const filePath = path.join(this.uploadDir, attachment.fileKey);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return this.attachmentsRepository.delete(id);
  }
}
