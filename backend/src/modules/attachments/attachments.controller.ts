import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { AttachmentsService } from './attachments.service';
import { UploadAttachmentDto } from './dto/attachment.dto';
import * as path from 'path';

@ApiTags('Attachments')
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
      },
    }),
  )
  @ApiOperation({ summary: 'Upload a file attachment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        taskId: { type: 'string', format: 'uuid' },
        projectId: { type: 'string', format: 'uuid' },
        entityType: { type: 'string', enum: ['TASK', 'PROJECT', 'COMMENT', 'DAILY_UPDATE'] },
        uploadedBy: { type: 'string', format: 'uuid' },
      },
      required: ['file', 'entityType', 'uploadedBy'],
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadAttachmentDto,
  ) {
    return this.attachmentsService.upload(file, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Download an attachment file' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'File stream' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const attachment = await this.attachmentsService.findById(id);
    const filePath = await this.attachmentsService.getFilePath(id);
    res.download(filePath, attachment.fileName);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an attachment' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Attachment deleted successfully' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.attachmentsService.delete(id);
  }
}
