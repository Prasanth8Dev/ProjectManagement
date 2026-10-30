import { Module } from '@nestjs/common';
import { DailyUpdatesController } from './daily-updates.controller';
import { DailyUpdatesService } from './daily-updates.service';
import { DailyUpdatesRepository } from './daily-updates.repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [NotificationsModule, UsersModule],
  controllers: [DailyUpdatesController],
  providers: [DailyUpdatesService, DailyUpdatesRepository],
  exports: [DailyUpdatesService],
})
export class DailyUpdatesModule {}
