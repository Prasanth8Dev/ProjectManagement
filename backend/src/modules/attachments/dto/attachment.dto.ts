import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsEnum } from 'class-validator';
import { AttachmentEntityType } from '@prisma/client';

export class UploadAttachmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  taskId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ enum: AttachmentEntityType })
  @IsEnum(AttachmentEntityType)
  entityType: AttachmentEntityType;

  @ApiProperty({ description: 'ID of the user uploading' })
  @IsUUID()
  uploadedBy: string;
}
