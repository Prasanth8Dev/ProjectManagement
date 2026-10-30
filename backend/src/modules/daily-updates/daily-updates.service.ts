import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { DailyUpdatesRepository } from './daily-updates.repository';
import {
  CreateDailyUpdateDto,
  UpdateDailyUpdateDto,
  DailyUpdateFilterDto,
} from './dto/daily-update.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from '../../common/utils/date.util';

const REPLY_ROLES = ['ADMIN', 'MANAGER', 'PROJECT_MANAGER'];

@Injectable()
export class DailyUpdatesService {
  constructor(
    private readonly dailyUpdatesRepository: DailyUpdatesRepository,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  async getReplies(updateId: string) {
    await this.findById(updateId);
    return this.dailyUpdatesRepository.findReplies(updateId);
  }

  /**
   * Leadership (Admin / Manager / Project Manager — CTOs use the Admin role)
   * may reply to any update; the update's author may reply back.
   */
  async createReply(updateId: string, authorId: string, content: string) {
    const update = await this.findById(updateId);
    const author = await this.usersService.findById(authorId).catch(() => null);
    if (!author) throw new ForbiddenException('Unknown user.');

    const isLeadership = REPLY_ROLES.includes(author.role);
    if (!isLeadership && update.userId !== authorId) {
      throw new ForbiddenException('Only Admins, Managers and Project Managers can reply to work updates.');
    }

    const reply = await this.dailyUpdatesRepository.createReply({
      dailyUpdateId: updateId,
      authorId,
      content,
    });

    if (update.userId !== authorId) {
      // Leadership replied -> tell the update's author.
      await this.notificationsService.notify({
        userId: update.userId,
        actorId: authorId,
        type: 'DAILY_UPDATE_REPLY',
        title: `${author.name} replied to your work update`,
        message: content.length > 120 ? content.slice(0, 117) + '...' : content,
        link: `/updates/${updateId}`,
        dailyUpdateId: updateId,
      });
    } else {
      // Author replied back -> tell everyone else who has replied.
      const others = new Set(
        (await this.dailyUpdatesRepository.findReplies(updateId))
          .map((r) => r.authorId)
          .filter((id) => id !== authorId),
      );
      for (const userId of others) {
        await this.notificationsService.notify({
          userId,
          actorId: authorId,
          type: 'DAILY_UPDATE_REPLY',
          title: `${author.name} replied on their work update`,
          link: `/updates/${updateId}`,
          dailyUpdateId: updateId,
        });
      }
    }

    return reply;
  }

  async findAll(filterDto: DailyUpdateFilterDto) {
    const { page = 1, limit = 20, userId, projectId, dateFrom, dateTo, sortOrder } = filterDto;
    const { updates, total } = await this.dailyUpdatesRepository.findAll({
      page,
      limit,
      userId,
      projectId,
      dateFrom,
      dateTo,
      sortOrder,
    });
    return createPaginatedResponse(updates, total, page, limit);
  }

  async findById(id: string) {
    const update = await this.dailyUpdatesRepository.findById(id);
    if (!update) {
      throw new NotFoundException(`Daily update with id ${id} not found`);
    }
    return update;
  }

  async findTodayForUser(userId: string) {
    const today = startOfDay(new Date());
    const update = await this.dailyUpdatesRepository.findByUserAndDate(userId, today);
    if (!update) {
      throw new NotFoundException(`No daily update found for user ${userId} today`);
    }
    return update;
  }

  async create(createDto: CreateDailyUpdateDto) {
    const date = startOfDay(new Date(createDto.date));

    // Check for duplicate
    const existing = await this.dailyUpdatesRepository.findByUserAndDate(createDto.userId, date);
    if (existing) {
      throw new ConflictException(
        `A daily update already exists for user ${createDto.userId} on ${createDto.date}`,
      );
    }

    try {
      return await this.dailyUpdatesRepository.create({
        userId: createDto.userId,
        date,
        summary: createDto.summary,
        hoursWorked: createDto.hoursWorked,
        tomorrowPlan: createDto.tomorrowPlan,
        blockers: createDto.blockers,
        mood: createDto.mood,
        tasks: createDto.tasks,
        projectIds: createDto.projectIds,
      });
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateDailyUpdateDto) {
    await this.findById(id);
    try {
      return await this.dailyUpdatesRepository.update(id, {
        summary: updateDto.summary,
        hoursWorked: updateDto.hoursWorked,
        tomorrowPlan: updateDto.tomorrowPlan,
        blockers: updateDto.blockers,
        mood: updateDto.mood,
        tasks: updateDto.tasks,
        projectIds: updateDto.projectIds,
      });
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string) {
    await this.findById(id);
    return this.dailyUpdatesRepository.delete(id);
  }

  async getDailyReport(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);
    const updates = await this.dailyUpdatesRepository.findForDateRange(start, end);
    return {
      date: start.toISOString().split('T')[0],
      totalUpdates: updates.length,
      updates,
    };
  }

  async getWeeklyReport(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const start = startOfWeek(targetDate);
    const end = endOfWeek(targetDate);
    const updates = await this.dailyUpdatesRepository.findForDateRange(start, end);

    return {
      weekStart: start.toISOString().split('T')[0],
      weekEnd: end.toISOString().split('T')[0],
      totalUpdates: updates.length,
      updates,
    };
  }
}
