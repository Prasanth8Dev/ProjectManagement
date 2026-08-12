import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@ApiTags('Comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('tasks/:taskId/comments')
  @ApiOperation({ summary: 'List comments for a task (with nested replies)' })
  @ApiParam({ name: 'taskId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  findByTaskId(@Param('taskId', ParseUUIDPipe) taskId: string) {
    return this.commentsService.findByTaskId(taskId);
  }

  @Post('tasks/:taskId/comments')
  @ApiOperation({ summary: 'Create a comment on a task' })
  @ApiParam({ name: 'taskId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  create(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() createDto: CreateCommentDto,
  ) {
    return this.commentsService.create(taskId, createDto);
  }

  @Patch('comments/:id')
  @ApiOperation({ summary: 'Edit a comment' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, updateDto);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Comment deleted successfully' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.delete(id);
  }
}
