import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { TasksService } from '../tasks/tasks.service';
import { BugsService } from '../bugs/bugs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly tasksService: TasksService,
    private readonly bugsService: BugsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /** Notify everyone @mentioned in a comment, skipping the author. */
  private async notifyMentions(params: {
    mentions: string[] | undefined;
    authorId: string;
    taskId?: string;
    bugId?: string;
    commentId: string;
    entityTitle: string;
  }) {
    const { mentions, authorId, taskId, bugId, commentId, entityTitle } = params;
    if (!mentions?.length) return;

    const uniqueMentions = [...new Set(mentions)].filter((id) => id !== authorId);
    await Promise.all(
      uniqueMentions.map((userId) =>
        this.notificationsService.notify({
          userId,
          actorId: authorId,
          type: 'MENTION',
          title: `You were mentioned in a comment on "${entityTitle}"`,
          link: taskId ? `/tasks/${taskId}` : `/bugs/${bugId}`,
          taskId,
          bugId,
          commentId,
        }),
      ),
    );
  }

  async findByTaskId(taskId: string) {
    await this.tasksService.findById(taskId);
    return this.commentsRepository.findByTaskId(taskId);
  }

  async findByBugId(bugId: string) {
    await this.bugsService.findById(bugId);
    return this.commentsRepository.findByBugId(bugId);
  }

  async create(taskId: string, createDto: CreateCommentDto) {
    const task = await this.tasksService.findById(taskId);

    if (createDto.parentId) {
      const parent = await this.commentsRepository.findById(createDto.parentId);
      if (!parent) {
        throw new NotFoundException(`Parent comment with id ${createDto.parentId} not found`);
      }
    }

    const comment = await this.commentsRepository.create({
      taskId,
      authorId: createDto.authorId,
      content: createDto.content,
      parentId: createDto.parentId,
      mentions: createDto.mentions,
    });

    // Notify the task's assignee and reporter (skip whoever just commented).
    const recipients = new Set(
      [task.assigneeId, task.reporterId].filter(
        (id): id is string => !!id && id !== createDto.authorId,
      ),
    );
    await Promise.all(
      [...recipients].map((userId) =>
        this.notificationsService.notify({
          userId,
          actorId: createDto.authorId,
          type: 'TASK_COMMENT',
          title: `New comment on "${task.title}"`,
          link: `/tasks/${taskId}`,
          taskId,
          commentId: comment.id,
        }),
      ),
    );

    await this.notifyMentions({
      mentions: createDto.mentions,
      authorId: createDto.authorId,
      taskId,
      commentId: comment.id,
      entityTitle: task.title,
    });

    return comment;
  }

  async createForBug(bugId: string, createDto: CreateCommentDto) {
    const bug = await this.bugsService.findById(bugId);

    if (createDto.parentId) {
      const parent = await this.commentsRepository.findById(createDto.parentId);
      if (!parent) {
        throw new NotFoundException(`Parent comment with id ${createDto.parentId} not found`);
      }
    }

    const comment = await this.commentsRepository.create({
      bugId,
      authorId: createDto.authorId,
      content: createDto.content,
      parentId: createDto.parentId,
      mentions: createDto.mentions,
    });

    // Notify the bug's assignee and reporter (skip whoever just commented).
    const recipients = new Set(
      [bug.assigneeId, bug.reporterId].filter(
        (id): id is string => !!id && id !== createDto.authorId,
      ),
    );
    await Promise.all(
      [...recipients].map((userId) =>
        this.notificationsService.notify({
          userId,
          actorId: createDto.authorId,
          type: 'BUG_COMMENT',
          title: `New comment on bug "${bug.title}"`,
          link: `/bugs/${bugId}`,
          bugId,
          commentId: comment.id,
        }),
      ),
    );

    await this.notifyMentions({
      mentions: createDto.mentions,
      authorId: createDto.authorId,
      bugId,
      commentId: comment.id,
      entityTitle: bug.title,
    });

    return comment;
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
