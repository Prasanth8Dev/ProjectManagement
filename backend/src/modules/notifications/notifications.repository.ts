import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { getPaginationParams } from '../../common/utils/pagination.util';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private get includes() {
    return {
      actor: { select: { id: true, name: true, avatar: true } },
    };
  }

  async findByUser(
    userId: string,
    params: { page: number; limit: number; isRead?: boolean },
  ) {
    const { page, limit, isRead } = params;
    const { skip, take } = getPaginationParams(page, limit);

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(isRead !== undefined && { isRead }),
    };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: this.includes,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { notifications, total };
  }

  async unreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }

  async findById(id: string) {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async create(data: Prisma.NotificationCreateInput) {
    return this.prisma.notification.create({ data, include: this.includes });
  }

  async markRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
      include: this.includes,
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }
}
