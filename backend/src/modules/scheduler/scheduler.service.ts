import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MeetingsService } from '../meetings/meetings.service';

const ETA_APPROACHING_HOURS = 24;
const ACTION_ITEM_DUE_SOON_HOURS = 24;
const NON_ACTIONABLE_STATUSES = ['DONE', 'CLOSED', 'CANCELLED'];

/**
 * Time-based notification sweeps that nothing else triggers — ETA
 * approaching / overdue tasks, and MOM action items due soon. Runs once a
 * day; since a still-overdue task or action item will be picked up again on
 * the next run, this behaves as a daily nudge rather than spamming on every
 * poll. Any single failure (bad row, notification error) is caught so it
 * never takes the rest of the sweep down.
 */
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly meetingsService: MeetingsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async runDailyNotificationSweep() {
    await Promise.all([
      this.notifyEtaApproaching().catch((err) =>
        this.logger.warn(`ETA-approaching sweep failed: ${err}`),
      ),
      this.notifyOverdueTasks().catch((err) =>
        this.logger.warn(`Overdue-tasks sweep failed: ${err}`),
      ),
      this.notifyActionItemsDueSoon().catch((err) =>
        this.logger.warn(`Action-item due-soon sweep failed: ${err}`),
      ),
    ]);
  }

  private async notifyEtaApproaching() {
    const now = new Date();
    const threshold = new Date(now.getTime() + ETA_APPROACHING_HOURS * 60 * 60 * 1000);

    const tasks = await this.prisma.task.findMany({
      where: {
        isArchived: false,
        assigneeId: { not: null },
        dueDate: { gte: now, lte: threshold },
        status: { notIn: NON_ACTIONABLE_STATUSES as any },
      },
      select: { id: true, title: true, assigneeId: true, dueDate: true },
    });

    for (const task of tasks) {
      await this.notificationsService.notify({
        userId: task.assigneeId,
        type: 'TASK_ETA_APPROACHING',
        title: `"${task.title}" is due soon`,
        message: task.dueDate ? `Due ${task.dueDate.toISOString().slice(0, 10)}` : undefined,
        link: `/tasks/${task.id}`,
        taskId: task.id,
      });
    }
  }

  private async notifyOverdueTasks() {
    const now = new Date();

    const tasks = await this.prisma.task.findMany({
      where: {
        isArchived: false,
        assigneeId: { not: null },
        dueDate: { lt: now },
        status: { notIn: NON_ACTIONABLE_STATUSES as any },
      },
      select: { id: true, title: true, assigneeId: true },
    });

    for (const task of tasks) {
      await this.notificationsService.notify({
        userId: task.assigneeId,
        type: 'TASK_OVERDUE',
        title: `"${task.title}" is overdue`,
        link: `/tasks/${task.id}`,
        taskId: task.id,
      });
    }
  }

  private async notifyActionItemsDueSoon() {
    const items = await this.meetingsService.findActionItemsDueSoon(ACTION_ITEM_DUE_SOON_HOURS);

    for (const item of items) {
      await this.notificationsService.notify({
        userId: item.assigneeId,
        type: 'MOM_ACTION_ITEM_DUE_SOON',
        title: `Action item "${item.title}" is due soon`,
        link: `/meetings/${item.meetingId}`,
        meetingId: item.meetingId,
        actionItemId: item.id,
      });
    }
  }
}
