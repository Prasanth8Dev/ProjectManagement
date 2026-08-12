import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { TasksService } from '../tasks/tasks.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly tasksService: TasksService,
  ) {}

  async findByTaskId(taskId: string) {
    await this.tasksService.findById(taskId);
    return this.commentsRepository.findByTaskId(taskId);
  }

  async create(taskId: string, createDto: CreateCommentDto) {
    await this.tasksService.findById(taskId);

    if (createDto.parentId) {
      const parent = await this.commentsRepository.findById(createDto.parentId);
      if (!parent) {
        throw new NotFoundException(`Parent comment with id ${createDto.parentId} not found`);
      }
    }

    return this.commentsRepository.create({
      taskId,
      authorId: createDto.authorId,
      content: createDto.content,
      parentId: createDto.parentId,
    });
  }

  async update(id: string, updateDto: UpdateCommentDto) {
    const comment = await this.commentsRepository.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    return this.commentsRepository.update(id, updateDto.content);
  }

  async delete(id: string) {
    const comment = await this.commentsRepository.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    return this.commentsRepository.delete(id);
  }
}
