import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { NotificationsRepository } from './notifications.repository';
import { NotificationFilterDto } from './dto/notification.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

export interface NotifyInput {
  userId: string | null | undefined;
  actorId?: string | null;
  type: NotificationType;
  title: string;
  message?: string;
  link?: string;
  taskId?: string;
  bugId?: string;
  commentId?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  async findForUser(userId: string, filterDto: NotificationFilterDto) {
    const { page = 1, limit = 20, isRead } = filterDto;
    const { notifications, total } = await this.notificationsRepository.findByUser(userId, {
      page,
      limit,
      isRead,
    });
    return createPaginatedResponse(notifications, total, page, limit);
  }

  async unreadCount(userId: string) {
    const count = await this.notificationsRepository.unreadCount(userId);
    return { count };
  }

  async markRead(id: string) {
    const notification = await this.notificationsRepository.findById(id);
    if (!notification) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }
    return this.notificationsRepository.markRead(id);
  }

  async markAllRead(userId: string) {
    await this.notificationsRepository.markAllRead(userId);
    return { success: true };
  }

  /**
   * Fire-and-forget helper other modules call to emit a notification
   * (task/bug assignment, new comment, mention, etc). Never throws —
   * a notification failure should never block the action that triggered it.
   * Also silently skips notifying someone about their own action.
   */
  async notify(input: NotifyInput): Promise<void> {
    if (!input.userId) return;
    if (input.actorId && input.actorId === input.userId) return;

    try {
      await this.notificationsRepository.create({
        user: { connect: { id: input.userId } },
        ...(input.actorId && { actor: { connect: { id: input.actorId } } }),
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link,
        taskId: input.taskId,
        bugId: input.bugId,
        commentId: input.commentId,
      });
    } catch (err) {
      this.logger.warn(`Failed to create notification for user ${input.userId}: ${err}`);
    }
  }
}
